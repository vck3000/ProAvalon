import Glicko2 from '../glicko2';
import { TeamEnum } from '../types';
import User from '../../models/user';
import Rank from '../../models/rank';
import RatingPeriodGameRecord from '../../models/RatingPeriodGameRecord';
import mongoose from 'mongoose';
import { Types } from 'mongoose';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const mockingoose = require('mockingoose');

describe('Glicko-2', () => {
  const user1Id = new Types.ObjectId('64562e343eb03ca9ac251655');
  const user2Id = new Types.ObjectId('64562e906fddefa87680cc3f');
  const user3Id = new Types.ObjectId('64562e96ce0da57d19e89002');
  const user4Id = new Types.ObjectId('64562e9d4af24569779941ac');
  const user5Id = new Types.ObjectId('64562ea4d18148c6be4ceeec');
  const user6Id = new Types.ObjectId('64562eaa96d5b620000ea3de');
  const user7Id = new Types.ObjectId('64563ed1cc26b8ffd49cd9f9');
  const user8Id = new Types.ObjectId('64587b6e8a1ea4182899427c');
  const glicko2 = new Glicko2();

  beforeAll(async () => {
    // Connect to Mongodb
    const dbLoc =
      'mongodb://root:password@localhost:27017/proavalon?authSource=admin';
    await mongoose.connect(dbLoc, {
      retryWrites: false,
    });

    const players = [
      {
        _id: user1Id,
        username: 'player1',
      },
      {
        _id: user2Id,
        username: 'player2',
      },
      {
        _id: user3Id,
        username: 'player3',
      },   
      {
        _id: user4Id,
        username: 'player4',
      },
      {
        _id: user5Id,
        username: 'player5',
      },   
      {
        _id: user6Id,
        username: 'player6',
      },   
      {
        _id: user7Id,
        username: 'player7',
      },   
      {
        _id: user8Id,
        username: 'player8',
      },   
    ];

    const ranks = [
      {
        userId: user1Id,
        seasonNumber: 0,
        playerRating: 1500,
        rd: 200,
        volatility: 0.06,
      },
      {
        userId: user2Id,
        seasonNumber: 0,
        playerRating: 1700,
        rd: 170,
        volatility: 0.06,
      },
      {
        userId: user3Id,
        seasonNumber: 0,
        playerRating: 1400,
        rd: 30,
        volatility: 0.06,
      },
      {
        userId: user4Id,
        seasonNumber: 0,
        playerRating: 1400,
        rd: 30,
        volatility: 0.06,
      },
      {
        userId: user5Id,
        seasonNumber: 0,
        playerRating: 1400,
        rd: 30,
        volatility: 0.06,
      },
      {
        userId: user6Id,
        seasonNumber: 0,
        playerRating: 2600,
        rd: 1110,
        volatility: 0.06,
      },
      {
        userId: user7Id,
        seasonNumber: 0,
        playerRating: 1400,
        rd: 30,
        volatility: 0.06,
      },
      {
        userId: user8Id,
        seasonNumber: 0,
        playerRating: 1500,
        rd: 200,
        volatility: 0.06,
      },
    ];

    const games = [
      {
        timeGameFinished: new Date(),
        winningTeam: TeamEnum.SPY,
        spyTeam: [user1Id, user2Id],
        resistanceTeam: [user3Id, user4Id, user5Id, user7Id],
        roomCreationType: '',
      },
      {
        timeGameFinished: new Date(),
        winningTeam: TeamEnum.SPY,
        spyTeam: [user2Id, user4Id],
        resistanceTeam: [user1Id, user3Id, user5Id, user6Id, user7Id],
        roomCreationType: '',
      },
      {
        timeGameFinished: new Date(),
        winningTeam: TeamEnum.RESISTANCE,
        spyTeam: [user1Id, user2Id],
        resistanceTeam: [user3Id, user4Id, user5Id, user6Id],
        roomCreationType: '',
      },
      {
        timeGameFinished: new Date(),
        winningTeam: TeamEnum.RESISTANCE,
        spyTeam: [user2Id, user3Id],
        resistanceTeam: [user4Id, user5Id, user6Id, user7Id],
        roomCreationType: '',
      },
      {
        timeGameFinished: new Date(),
        winningTeam: TeamEnum.SPY,
        spyTeam: [user2Id, user3Id],
        resistanceTeam: [user4Id, user5Id, user6Id, user7Id],
        roomCreationType: '',
      },
      {
        timeGameFinished: new Date(),
        winningTeam: TeamEnum.RESISTANCE,
        spyTeam: [user7Id, user4Id],
        resistanceTeam: [user5Id, user5Id, user6Id],
        roomCreationType: '',
      },
    ];

    await User.insertMany(players);
    await Rank.insertMany(ranks);
    await RatingPeriodGameRecord.insertMany(games);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Rank.deleteMany({});
    await RatingPeriodGameRecord.deleteMany({});
    mongoose.disconnect();
  });

  it('calculates the correct ratings, rd, and volatility for a user after the rating period ends', async () => {
    await glicko2.updateRatingsByUser(user1Id);
    const newRank = await Rank.findOne({
      userId: user1Id,
      seasonNumber: 1,
    });

    expect(newRank.playerRating).toBeCloseTo(1464.05);
    expect(newRank.rd).toBeCloseTo(151.52);
    expect(newRank.volatility).toBeCloseTo(0.05999);
  });

  it('computes the correct ratings for an inactive player', async () => {
    const oldRank = await Rank.findOne({
      userId: user8Id,
      seasonNumber: 0,
    });

    await glicko2.updateRatingsByUser(user8Id);
    const newRank = await Rank.findOne({
      userId: user8Id,
      seasonNumber: 1,
    });
    expect(newRank.playerRating).toBe(oldRank.playerRating);
    expect(newRank.rd).toBeGreaterThan(oldRank.rd);
    expect(newRank.volatility).toBe(oldRank.volatility);
  });

  // it('should update the season number after updating all users', () => {

  // })
});

