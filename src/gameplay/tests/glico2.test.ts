import { glicko2Update } from '../glicko2';

describe('Glicko-2', () => {
  let playerOne, matches;

  beforeAll(() => {
    playerOne = {
      username: 'playerone',
      userid: 1,
      alliance: 'Resistance', // or 'Spy',
      request: {
        user: {
          playerRating: 1500,
          ratingDeviation: 200,
          ratingVolatility: 0.06,
        },
      },
    };

    matches = [
      {
        winningTeam: 'Resistance',
        opponentTeamRating: 1400,
        opponentTeamRatingDeviation: 30,
      },
      {
        winningTeam: 'Spy',
        opponentTeamRating: 1550,
        opponentTeamRatingDeviation: 100,
      },
      {
        winningTeam: 'Spy',
        opponentTeamRating: 1700,
        opponentTeamRatingDeviation: 300,
      },
    ];
  });

  it('should use the game data from rating period to calculate new rating correctly', () => {
    const { playerRating } = glicko2Update(playerOne, matches);
    expect(playerRating).toBeCloseTo(1464.05);
  });

  it('should use the game data from rating period to calculate new RD correctly', () => {
    const { ratingDeviation } = glicko2Update(playerOne, matches);
    expect(ratingDeviation).toBeCloseTo(151.52);
  });

  it('should only update RD for inactive player', () => {
    const { playerRating } = glicko2Update(playerOne, []);
    expect(playerRating).toBe(playerOne.request.user.playerRating);
  });

  it('should update the RD correctly for inactive player', () => {
    const { ratingDeviation } = glicko2Update(playerOne, []);
    const phi = playerOne.request.user.ratingDeviation / 173.7178;
    expect(ratingDeviation).toBe(173.7178 * Math.sqrt(phi ** 2 + playerOne.request.user.ratingVolatility ** 2));
  });
});