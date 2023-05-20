import Glicko2 from '../glicko2';
import { Types } from 'mongoose';
import Mongo from '../../db/mongo';
import { TeamEnum } from '../types';

describe('Glicko-2 Unit Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates correct ratings for an active player', async () => {
    const user1ObjectId = new Types.ObjectId();
    const userRankObjectId = new Types.ObjectId();

    const mockUser = {
      _id: user1ObjectId,
      username: 'user1',
      currentRanking: userRankObjectId,
    };

    const mockUser1Rank = {
      _id: userRankObjectId,
      userId: user1ObjectId,
      seasonNumber: 0,
      playerRating: 1500,
      rd: 200,
      volatility: 0.06,
    };

    const mockGames = [
      {
        timeGameFinished: new Date(),
        winningTeam: TeamEnum.SPY,
        spyTeam: ['user1', 'user2'],
        resistanceTeam: ['user3', 'user4', 'user5', 'user7'],
        roomCreationType: '',
      },
      {
        timeGameFinished: new Date(),
        winningTeam: TeamEnum.SPY,
        spyTeam: ['user2', 'user4'],
        resistanceTeam: ['user1', 'user3', 'user5', 'user6', 'user7'],
        roomCreationType: '',
      },
      {
        timeGameFinished: new Date(),
        winningTeam: TeamEnum.RESISTANCE,
        spyTeam: ['user1', 'user2'],
        resistanceTeam: ['user3', 'user4', 'user5', 'user6'],
        roomCreationType: '',
      },
    ];


    jest
      .spyOn(Mongo, 'getUserByUserId')
      .mockResolvedValueOnce(mockUser);

    jest
      .spyOn(Mongo, 'getGamesByUsername')
      .mockResolvedValueOnce(mockGames);

    jest
      .spyOn(Mongo, 'getRankByUserId')
      .mockResolvedValueOnce(mockUser1Rank);

    jest
      .spyOn(Mongo, 'getRankByUsername')
      .mockImplementation((username) => {
        switch(username) {
          case 'user1':
            return Promise.resolve({
              userId: user1ObjectId,
              playerRating: 1500,
              rd: 200,
              volatility: 0.06,
            });
          case 'user2':
            return Promise.resolve({
              userId: new Types.ObjectId(),
              playerRating: 1700,
              rd: 170,
              volatility: 0.06,
            });
          case 'user3':
            return Promise.resolve({
              userId: new Types.ObjectId(),
              playerRating: 1400,
              rd: 30,
              volatility: 0.06,
            });
          case 'user4':
            return Promise.resolve({
              userId: new Types.ObjectId(),
              playerRating: 1400,
              rd: 30,
              volatility: 0.06,
            });
          case 'user5':
            return Promise.resolve({
              userId: new Types.ObjectId(),
              playerRating: 1400,
              rd: 30,
              volatility: 0.06,
            });
          case 'user6':
            return Promise.resolve({
              userId: new Types.ObjectId(),
              playerRating: 2600,
              rd: 1110,
              volatility: 0.06,
            });
          case 'user7':
            return Promise.resolve({
              userId: new Types.ObjectId(),
              playerRating: 1400,
              rd: 30,
              volatility: 0.06,
            }); 
        }
      });

    const updatedRank = await Glicko2.computeRankRatingsByUserId(
      mockUser._id.toString(),
    );

    expect(updatedRank.playerRating).toBeCloseTo(1464.05);
    expect(updatedRank.rd).toBeCloseTo(151.52);
    expect(updatedRank.volatility).toBeCloseTo(0.05999);
  });

  it('calculates correct ratings for an inactive player', async () => {
    const userObjectId = new Types.ObjectId();
    const userRankObjectId = new Types.ObjectId();

    const mockUser = {
      _id: userObjectId,
      username: 'inactiveUser',
      currentRanking: userRankObjectId,
    };

    const mockRank = {
      _id: userRankObjectId,
      userId: userObjectId,
      seasonNumber: 0,
      playerRating: 1500,
      rd: 200,
      volatility: 0.06,
    };

    jest
      .spyOn(Mongo, 'getUserByUserId')
      .mockResolvedValueOnce(mockUser);

    jest
      .spyOn(Mongo, 'getGamesByUsername')
      .mockResolvedValueOnce([]);

    jest
      .spyOn(Mongo, 'getRankByUserId')
      .mockResolvedValueOnce(mockRank);

    const updatedRank = await Glicko2.computeRankRatingsByUserId(
      mockUser._id.toString(),
    );

    expect(updatedRank.playerRating).toBe(mockRank.playerRating);
    expect(updatedRank.rd).toBeGreaterThan(mockRank.rd);
    expect(updatedRank.volatility).toBe(mockRank.volatility);
  });
});
