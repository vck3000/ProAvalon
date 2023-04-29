import Glicko2 from "../glicko2";
import type { IUser } from "../types";
import { TeamEnum } from "../types";
import { IRatingPeriodGameRecord } from "../../models/types";

describe('Glicko-2', () => {
  let playerOne: IUser, games: IRatingPeriodGameRecord[], glicko2: Glicko2;

  beforeAll(() => {
    glicko2 = new Glicko2();

    playerOne = {
      username: 'playerone',
      playerRating: 1500,
      ratingDeviation: 200,
      ratingVolatility: 0.06,
    };

    games = [
      {
        timeGameStarted: new Date(),
        timeGameFinished: new Date(),
        winningTeam: 'Resistance',
        spyTeam: [],
        resistanceTeam: [playerOne.username],
        numberOfPlayers: 6,
        roomCreationType: '',
        
        avgRating: 1400,
        avgRd: 30,
      },
      {
        timeGameStarted: new Date(),
        timeGameFinished: new Date(),
        winningTeam: 'Resistance',
        spyTeam: [playerOne.username],
        resistanceTeam: [],
        numberOfPlayers: 6,
        roomCreationType: '',

        avgRating: 1550,
        avgRd: 100,
      },
      {
        timeGameStarted: new Date(),
        timeGameFinished: new Date(),
        winningTeam: 'Spy',
        spyTeam: [],
        resistanceTeam: [playerOne.username],
        numberOfPlayers: 6,
        roomCreationType: '',

        avgRating: 1700,
        avgRd: 300,
      },
    ];
  });

  it('should use the game data from rating period to calculate new rating correctly', () => {
    const { playerRating } = glicko2.updateRatingsByPlayer(playerOne, games);
    expect(playerRating).toBeCloseTo(1464.05);
  });

  it('should use the game data from rating period to calculate new RD correctly', () => {
    const { ratingDeviation } = glicko2.updateRatingsByPlayer(playerOne, games);
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