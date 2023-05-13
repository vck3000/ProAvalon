import Glicko2 from '../glicko2';
import { Types } from 'mongoose';
import Mongo from '../../db/Mongo';

describe('Glicko-2 Unit Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates correct ratings for an active player', async () => {
    const userObjectId = new Types.ObjectId('64562e343eb03ca9ac251655');
    const userRankObjectId = new Types.ObjectId('645dd08f1ccd75103d836fc3');

    const mockUser = {
      _id: userObjectId,
      username: 'mockuser',
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

    const getUserByUserIdSpy = jest.spyOn(Mongo, 'getUserByUserId').mockResolvedValueOnce(mockUser);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const summariseGamesSpy = jest.spyOn(Glicko2 as any, 'summariseGames').mockResolvedValueOnce([
      { opponentRating: 1400, opponentRatingDeviation: 30, outcome: 1 },
      { opponentRating: 1550, opponentRatingDeviation: 100, outcome: 0 },
      { opponentRating: 1700, opponentRatingDeviation: 300, outcome: 0 }
    ]);
    const getRankByUserIdSpy = jest.spyOn(Mongo, 'getRankByUserId').mockResolvedValueOnce(mockRank);

    const updatedRank = await Glicko2.computeRankRatingsByUserId(mockUser._id.toString());
    expect(getUserByUserIdSpy).toHaveBeenCalledWith(mockUser._id.toString());
    expect(summariseGamesSpy).toHaveBeenCalledWith(mockUser._id.toString());
    expect(getRankByUserIdSpy).toHaveBeenCalledWith(mockUser._id.toString());

    expect(updatedRank.playerRating).toBeCloseTo(1464.05);
    expect(updatedRank.rd).toBeCloseTo(151.52);
    expect(updatedRank.volatility).toBeCloseTo(0.05999);
  });

  it('calculates correct ratings for an inactive player', async () => {
    const userObjectId = new Types.ObjectId('64587b6e8a1ea4182899427c');
    const userRankObjectId = new Types.ObjectId('645dd0c6eb4e7baa741db97f');

    const mockUser = {
      _id: userObjectId,
      username: 'mockuser',
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

    const getUserByUserIdSpy = jest.spyOn(Mongo, 'getUserByUserId').mockResolvedValueOnce(mockUser);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const summariseGamesSpy = jest.spyOn(Glicko2 as any, 'summariseGames').mockResolvedValueOnce([]);
    const getRankByUserIdSpy = jest.spyOn(Mongo, 'getRankByUserId').mockResolvedValueOnce(mockRank);

    const updatedRank = await Glicko2.computeRankRatingsByUserId(mockUser._id.toString());
    expect(getUserByUserIdSpy).toHaveBeenCalledWith(mockUser._id.toString());
    expect(summariseGamesSpy).toHaveBeenCalledWith(mockUser._id.toString());
    expect(getRankByUserIdSpy).toHaveBeenCalledWith(mockUser._id.toString());
    
    expect(updatedRank.playerRating).toBe(mockRank.playerRating);
    expect(updatedRank.rd).toBeGreaterThan(mockRank.rd);
    expect(updatedRank.volatility).toBe(mockRank.volatility);
  });
});
