import type { Player, Match } from './types';

class Glicko2 {
  #epsilon: number;
  #tau: number;

  constructor() {
    this.#epsilon = 0.000001;

    // system constant tau is set as 0.5
    this.#tau = 0.5;
  }

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

  updateRatings(
    playerData: Player,
    matchHistory: Match[],
  ): {
    playerRating: number;
    ratingDeviation: number;
  } {
    // Step 2: Convert to Glicko-2 scale
    const player = {
      mu: (playerData.playerRating - 1500) / 173.7178,
      phi: playerData.ratingDeviation / 173.7178,
      ratingVolatility: playerData.ratingVolatility,
    };

    // Check if the player competed during the rating period
    if (matchHistory.length == 0) {
      const newPhi = Math.sqrt(player.phi ** 2 + player.ratingVolatility ** 2);
      const newRD = 173.7178 * newPhi;

      return {
        playerRating: playerData.playerRating,
        ratingDeviation: newRD,
      };
    }

    const opponents = matchHistory.map((m) => {
      const mu = (m.opponentTeamRating - 1500) / 173.7178;
      const phi = m.opponentTeamRatingDeviation / 173.7178;
      return {
        mu,
        phi,
        g: this.#computeG(phi),
        E: this.#computeE(player.mu, mu, phi),
        s: m.winningTeam === m.playerTeam ? 1 : 0,
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
    // TODO: Save the new volatility to the player

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

    return {
      playerRating: newRating,
      ratingDeviation: newRD,
    };
  }
}

export default Glicko2;
