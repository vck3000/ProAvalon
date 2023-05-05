import type { IUser } from './types';
import type { IRatingPeriodGameRecord } from '../models/types';
import { TeamEnum, OutcomeEnum } from './types';
import User from '../models/user';
import RatingPeriodGameRecord from '../models/RatingPeriodGameRecord';
import Rank from '../models/rank';
import { Types } from 'mongoose';

class Glicko2 {
  #epsilon = 0.000001;
  #tau = 0.5;
  #CURRENT_SEASON = 1;

  #computeG(phi: number): number {
    return 1 / Math.sqrt(1 + (3 * phi ** 2) / Math.PI ** 2);
  }

  #computeE(mu: number, mu_j: number, phi_j: number): number {
    return 1 / (1 + Math.exp(-1 * this.#computeG(phi_j) * (mu - mu_j)));
  }

  #computeNewVolatility(
    delta: number,
    phi: number,
    v: number,
    sigma: number,
  ): number {
    const a = Math.log(sigma ** 2);
    const computeF = (x: number): number => {
      let output = 0;

      output +=
        (Math.E ** x * (delta ** 2 - phi ** 2 - v - Math.E ** x)) /
        (2 * (phi ** 2 + v + Math.E ** x) ** 2);
      output -= (x - a) / this.#tau ** 2;
      return output;
    };

    let A = a;
    let B = 0;
    if (delta ** 2 > phi ** 2 + v) {
      B = Math.log(delta ** 2 - phi ** 2 - v);
    } else {
      let k = 1;
      while (computeF(a - k * this.#tau) < 0) {
        k += 1;
      }
      B = a - k * this.#tau;
    }

    let f_A = computeF(A);
    let f_B = computeF(B);

    while (Math.abs(B - A) > this.#epsilon) {
      const C = A + ((A - B) * f_A) / (f_B - f_A);
      const f_C = computeF(C);
      if (f_C * f_B <= 0) {
        A = B;
        f_A = f_B;
      } else {
        f_A /= 2;
      }

      B = C;
      f_B = f_C;
    }

    return Math.E ** (A / 2);
  }

  async #computeTeamAvg(team: Types.ObjectId[]): Promise<{
    ratingAvg: number;
    rdAvg: number;
  }> {
    let ratingSum = 0;
    let rdSum = 0;
    for (const playerId of team) {
      const { playerRating, rd } = await Rank.findOne({
        userId: playerId,
        seasonNumber: this.#CURRENT_SEASON - 1,
      });
      ratingSum += playerRating;
      rdSum += rd;
    }
    return {
      ratingAvg: ratingSum / team.length,
      rdAvg: rdSum / team.length,
    };
  }

  async #summariseGames(
    userId: Types.ObjectId,
  ) : Promise<{
    opponentRating: number,
    opponentRatingDeviation: number,
    outcome: OutcomeEnum
  }[]> {
    // Find games the player has played. Either Spy team or Resistance team.
    const games: IRatingPeriodGameRecord[] = await RatingPeriodGameRecord.find({
      $or: [{ spyTeam: userId }, { resistanceTeam: userId }],
    });

    return Promise.all(games.map(async g => {
      // Calculate the avg ratings and avg RD of the opponents

      if (g.spyTeam.includes(userId)) {
        // player is in team SPY
        const resistanceTeam = [...g.resistanceTeam];
        const { ratingAvg, rdAvg } = await this.#computeTeamAvg(resistanceTeam);

        return {
          opponentRating: ratingAvg,
          opponentRatingDeviation: rdAvg,
          outcome: g.winningTeam === TeamEnum.SPY ? OutcomeEnum.WIN : OutcomeEnum.LOSE,
        };
      } else {
        // player is in team RESISTANCE
        const spyTeam = [...g.spyTeam];
        const { ratingAvg, rdAvg } = await this.#computeTeamAvg(spyTeam);

        return {
          opponentRating: ratingAvg,
          opponentRatingDeviation: rdAvg,
          outcome: g.winningTeam === TeamEnum.RESISTANCE ? OutcomeEnum.WIN : OutcomeEnum.LOSE,
        };
      }
    }));
  }

  async updateRatingsByUser(user: IUser): Promise<void> {
    const userId = (await User.findOne({ username: user.username }))
      ._id;
    const gameSummary = await this.#summariseGames(userId);
    const userRankData = await Rank.findOne({
      userId: userId,
      seasonNumber: this.#CURRENT_SEASON - 1,
    });

    // Step 2: Convert to Glicko-2 scale
    const player = {
      username: user.username,
      mu: (user.playerRating - 1500) / 173.7178,
      phi: userRankData.rd / 173.7178,
      ratingVolatility: userRankData.volatility,
    };

    // Check if the player competed during the rating period
    // If the player does not compete during the rating period
    // Rating and Volatility remain the same, but the RD increases
    if (gameSummary.length == 0) {
      const newPhi = Math.sqrt(player.phi ** 2 + player.ratingVolatility ** 2);
      const newRD = 173.7178 * newPhi;

      await Rank.create({
        userId: userId,
        seasonNumber: this.#CURRENT_SEASON,
        playerRating: userRankData.playerRating,
        rd: newRD,
        volatility: userRankData.playerRating,
      });

      return;
    }

    const opponents = gameSummary.map((game) => {
      const mu = (game.opponentRating - 1500) / 173.7178;
      const phi = game.opponentRatingDeviation / 173.7178;
      return {
        mu,
        phi,
        g: this.#computeG(phi),
        E: this.#computeE(player.mu, mu, phi),
        s: game.outcome,
      };
    });

    // Step 3: Compute the quantity v (estimated variance)
    let v = 0;
    for (const opponent of opponents) {
      const { g, E } = opponent;
      v += g ** 2 * E * (1 - E);
    }
    v = v ** -1;

    // Step 4: Compute the quantity delta
    let delta = 0;
    for (const opponent of opponents) {
      const { g, E } = opponent;
      delta += g * (opponent.s - E);
    }
    delta *= v;

    // Step 5: Determine the new value of the volatility
    const newVolatility = this.#computeNewVolatility(
      delta,
      player.phi,
      v,
      player.ratingVolatility,
    );

    // Step 6: Update the rating deviation to the new pre-rating period value
    const preRatingPhi = Math.sqrt(player.phi ** 2 + newVolatility ** 2);

    // Step 7: Update the rating and RD
    const newPhi = 1 / Math.sqrt(1 / preRatingPhi ** 2 + 1 / v);
    let newMu = 0;
    for (const opponent of opponents) {
      const { g, E } = opponent;
      newMu += g * (opponent.s - E);
    }
    newMu *= newPhi ** 2;
    newMu += player.mu;

    // Step 8: Convert back to Glicko scale
    const newRating = 173.7178 * newMu + 1500;
    const newRD = 173.7178 * newPhi;

    // Save the new rankings to database
    await Rank.create({
      userId: userId,
      seasonNumber: this.#CURRENT_SEASON,
      playerRating: newRating,
      rd: newRD,
      volatility: newVolatility,
    });
  }

  async updateAllUsers(): Promise<void> {
    const users = await User.find({});
    for (const user of users) {
      await this.updateRatingsByUser(user);
    }
    // TODO: handle season change. Confirm if this is correct.
    this.#CURRENT_SEASON += 1;
  }
}

export default Glicko2;
