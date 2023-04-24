import Glicko2 from "../glicko2";
import type { Player, Match } from "../types";

describe('Glicko-2', () => {
  let playerOne: Player, matches: Match[], glicko2: Glicko2;

  beforeAll(() => {
    glicko2 = new Glicko2();

    playerOne = {
      username: 'playerone',
      userid: 1,
      playerRating: 1500,
      ratingDeviation: 200,
      ratingVolatility: 0.06,
    };

    matches = [
      {
        winningTeam: 'Resistance',
        playerTeam: 'Resistance',
        opponentTeamRating: 1400,
        opponentTeamRatingDeviation: 30,
      },
      {
        winningTeam: 'Resistance',
        playerTeam: 'Spy',
        opponentTeamRating: 1550,
        opponentTeamRatingDeviation: 100,
      },
      {
        winningTeam: 'Spy',
        playerTeam: 'Resistance',
        opponentTeamRating: 1700,
        opponentTeamRatingDeviation: 300,
      },
    ];
  });

  it('should use the game data from rating period to calculate new rating correctly', () => {
    const { playerRating } = glicko2.updateRatingsByPlayer(playerOne, matches);
    expect(playerRating).toBeCloseTo(1464.05);
  });

  it('should use the game data from rating period to calculate new RD correctly', () => {
    const { ratingDeviation } = glicko2.updateRatingsByPlayer(playerOne, matches);
    expect(ratingDeviation).toBeCloseTo(151.52);
  });

  it('should only update RD for inactive player', () => {
    const { playerRating } = glicko2.updateRatingsByPlayer(playerOne, []);
    expect(playerRating).toBe(playerOne.playerRating);
  });

  it('should update the RD correctly for inactive player', () => {
    const { ratingDeviation } = glicko2.updateRatingsByPlayer(playerOne, []);
    const phi = playerOne.ratingDeviation / 173.7178;
    expect(ratingDeviation).toBe(173.7178 * Math.sqrt(phi ** 2 + playerOne.ratingVolatility ** 2));
  });
});