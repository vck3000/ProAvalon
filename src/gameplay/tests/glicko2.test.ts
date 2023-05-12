import Glicko2 from '../glicko2';

import { MongoInterface } from '../../db/mongodb';

jest.mock('../../db/mongodb');

describe('Glicko-2', () => {
  it('test', () => {
    const glicko2 = new Glicko2();

    // @ts-ignore
    MongoInterface.GetUserByUsername = (username: string) => {
      if (username === 'pronub') {
        return { asdf: 123 };
      } else if (username === 'asdf') {
        return { qwer: 12345 };
      } else {
        return { zcxv: 123123 };
      }
    };

    // @ts-ignore
    glicko2.updateRatingsByUser(123);
  });

  // const user1Id = new Types.ObjectId('64562e343eb03ca9ac251655');
  // const user2Id = new Types.ObjectId('64562e906fddefa87680cc3f');
  // const user3Id = new Types.ObjectId('64562e96ce0da57d19e89002');
  // const user4Id = new Types.ObjectId('64562e9d4af24569779941ac');
  // const user5Id = new Types.ObjectId('64562ea4d18148c6be4ceeec');
  // const user6Id = new Types.ObjectId('64562eaa96d5b620000ea3de');
  // const user7Id = new Types.ObjectId('64563ed1cc26b8ffd49cd9f9');
  // const user8Id = new Types.ObjectId('64587b6e8a1ea4182899427c');
  // const user1RankId = new Types.ObjectId('645dd08f1ccd75103d836fc3');
  // const user2RankId = new Types.ObjectId('645dd0980e0c62a9ae0d8838');
  // const user3RankId = new Types.ObjectId('645dd09e90d66b459e00a514');
  // const user4RankId = new Types.ObjectId('645dd0a7ccde597885d62d68');
  // const user5RankId = new Types.ObjectId('645dd0af573d407368b16575');
  // const user6RankId = new Types.ObjectId('645dd0b46e7262486080f9a0');
  // const user7RankId = new Types.ObjectId('645dd0c2ad264ce20e5555e4');
  // const user8RankId = new Types.ObjectId('645dd0c6eb4e7baa741db97f');
  // const glicko2 = new Glicko2();
  //
  // beforeAll(async () => {
  //   // Connect to Mongodb
  //   const dbLoc =
  //     'mongodb://root:password@localhost:27017/proavalon?authSource=admin';
  //   await mongoose.connect(dbLoc, {
  //     retryWrites: false,
  //   });
  //
  //   const players = [
  //     {
  //       _id: user1Id,
  //       username: 'player1',
  //       currentRanking: user1RankId,
  //     },
  //     {
  //       _id: user2Id,
  //       username: 'player2',
  //       currentRanking: user2RankId,
  //     },
  //     {
  //       _id: user3Id,
  //       username: 'player3',
  //       currentRanking: user3RankId,
  //     },
  //     {
  //       _id: user4Id,
  //       username: 'player4',
  //       currentRanking: user4RankId,
  //     },
  //     {
  //       _id: user5Id,
  //       username: 'player5',
  //       currentRanking: user5RankId,
  //     },
  //     {
  //       _id: user6Id,
  //       username: 'player6',
  //       currentRanking: user6RankId,
  //     },
  //     {
  //       _id: user7Id,
  //       username: 'player7',
  //       currentRanking: user7RankId,
  //     },
  //     {
  //       _id: user8Id,
  //       username: 'player8',
  //       currentRanking: user8RankId,
  //     },
  //   ];
  //
  //   const ranks = [
  //     {
  //       _id: user1RankId,
  //       userId: user1Id,
  //       seasonNumber: 0,
  //       playerRating: 1500,
  //       rd: 200,
  //       volatility: 0.06,
  //     },
  //     {
  //       _id: user2RankId,
  //       userId: user2Id,
  //       seasonNumber: 0,
  //       playerRating: 1700,
  //       rd: 170,
  //       volatility: 0.06,
  //     },
  //     {
  //       _id: user3RankId,
  //       userId: user3Id,
  //       seasonNumber: 0,
  //       playerRating: 1400,
  //       rd: 30,
  //       volatility: 0.06,
  //     },
  //     {
  //       _id: user4RankId,
  //       userId: user4Id,
  //       seasonNumber: 0,
  //       playerRating: 1400,
  //       rd: 30,
  //       volatility: 0.06,
  //     },
  //     {
  //       _id: user5RankId,
  //       userId: user5Id,
  //       seasonNumber: 0,
  //       playerRating: 1400,
  //       rd: 30,
  //       volatility: 0.06,
  //     },
  //     {
  //       _id: user6RankId,
  //       userId: user6Id,
  //       seasonNumber: 0,
  //       playerRating: 2600,
  //       rd: 1110,
  //       volatility: 0.06,
  //     },
  //     {
  //       _id: user7RankId,
  //       userId: user7Id,
  //       seasonNumber: 0,
  //       playerRating: 1400,
  //       rd: 30,
  //       volatility: 0.06,
  //     },
  //     {
  //       _id: user8RankId,
  //       userId: user8Id,
  //       seasonNumber: 0,
  //       playerRating: 1500,
  //       rd: 200,
  //       volatility: 0.06,
  //     },
  //   ];
  //
  //   const games = [
  //     {
  //       timeGameFinished: new Date(),
  //       winningTeam: TeamEnum.SPY,
  //       spyTeam: [user1Id, user2Id],
  //       resistanceTeam: [user3Id, user4Id, user5Id, user7Id],
  //       roomCreationType: '',
  //     },
  //     {
  //       timeGameFinished: new Date(),
  //       winningTeam: TeamEnum.SPY,
  //       spyTeam: [user2Id, user4Id],
  //       resistanceTeam: [user1Id, user3Id, user5Id, user6Id, user7Id],
  //       roomCreationType: '',
  //     },
  //     {
  //       timeGameFinished: new Date(),
  //       winningTeam: TeamEnum.RESISTANCE,
  //       spyTeam: [user1Id, user2Id],
  //       resistanceTeam: [user3Id, user4Id, user5Id, user6Id],
  //       roomCreationType: '',
  //     },
  //     {
  //       timeGameFinished: new Date(),
  //       winningTeam: TeamEnum.RESISTANCE,
  //       spyTeam: [user2Id, user3Id],
  //       resistanceTeam: [user4Id, user5Id, user6Id, user7Id],
  //       roomCreationType: '',
  //     },
  //     {
  //       timeGameFinished: new Date(),
  //       winningTeam: TeamEnum.SPY,
  //       spyTeam: [user2Id, user3Id],
  //       resistanceTeam: [user4Id, user5Id, user6Id, user7Id],
  //       roomCreationType: '',
  //     },
  //     {
  //       timeGameFinished: new Date(),
  //       winningTeam: TeamEnum.RESISTANCE,
  //       spyTeam: [user7Id, user4Id],
  //       resistanceTeam: [user5Id, user5Id, user6Id],
  //       roomCreationType: '',
  //     },
  //   ];
  //
  //   await User.insertMany(players);
  //   await Rank.insertMany(ranks);
  //   await RatingPeriodGameRecord.insertMany(games);
  // });
  //
  // afterAll(async () => {
  //   await User.deleteMany({});
  //   await Rank.deleteMany({});
  //   await RatingPeriodGameRecord.deleteMany({});
  //   mongoose.disconnect();
  // });
  //
  // it('calculates the correct ratings, rd, and volatility for a user after the rating period ends', async () => {
  //   await glicko2.updateRatingsByUser(user1Id);
  //   const updatedRank = await Rank.findOne({
  //     _id: user1RankId
  //   });
  //
  //   expect(updatedRank.playerRating).toBeCloseTo(1464.05);
  //   expect(updatedRank.rd).toBeCloseTo(151.52);
  //   expect(updatedRank.volatility).toBeCloseTo(0.05999);
  // });
  //
  // it('computes the correct ratings for an inactive player', async () => {
  //   const oldRank = await Rank.findOne({
  //     userId: user8Id,
  //     seasonNumber: 0,
  //   });
  //
  //   await glicko2.updateRatingsByUser(user8Id);
  //   const updatedRank = await Rank.findOne({
  //     _id: user8RankId,
  //   });
  //   expect(updatedRank.playerRating).toBe(oldRank.playerRating);
  //   expect(updatedRank.rd).toBeGreaterThan(oldRank.rd);
  //   expect(updatedRank.volatility).toBe(oldRank.volatility);
  // });

  // it('should update the season number after updating all users', () => {

  // })
});

// describe('Testing User and Rank model', () => {

//   beforeAll(() => {
//     // Reset all mocks
//     mockingoose.resetAll();

//     mockingoose(User).toReturn([
//       {
//         _id: player1Id,
//         username: 'player1'
//       },
//       {
//         _id: player2Id,
//         username: 'player2'
//       },
//       {
//         _id: player3Id,
//         username: 'player3'
//       },
//       {
//         _id: player4Id,
//         username: 'player4'
//       },
//       {
//         _id: player5Id,
//         username: 'player5'
//       },
//       {
//         _id: player6Id,
//         username: 'player6'
//       },
//     ]);

//     mockingoose(Rank).toReturn([
//       {
//         userId: player1Id,
//         seasonNumber: 0,
//         playerRating: 1500,
//         rd: 200,
//         volatility: 0.06,
//       },
//       {
//         userId: player2Id,
//         seasonNumber: 0,
//         playerRating: 1500,
//         rd: 200,
//         volatility: 0.06,
//       },
//       {
//         userId: player3Id,
//         seasonNumber: 0,
//         playerRating: 1500,
//         rd: 200,
//         volatility: 0.06,
//       },
//       {
//         userId: player4Id,
//         seasonNumber: 0,
//         playerRating: 1500,
//         rd: 200,
//         volatility: 0.06,
//       },
//       {
//         userId: player5Id,
//         seasonNumber: 0,
//         playerRating: 1500,
//         rd: 200,
//         volatility: 0.06,
//       },
//       {
//         userId: player6Id,
//         seasonNumber: 0,
//         playerRating: 1500,
//         rd: 200,
//         volatility: 0.06,
//       },
//     ]);
//     mockingoose(RatingPeriodGameRecord).toReturn([
//       {
//         timeGameFinished: new Date(),
//         winningTeam: 'Resistance',
//         spyTeam: [ player5Id, player6Id ],
//         resistanceTeam: [ player1Id, player2Id, player3Id, player4Id ],
//         numberOfPlayers: 6,
//         roomCreationType: '',
//       },
//       {
//         timeGameFinished: new Date(),
//         winningTeam: 'Resistance',
//         spyTeam: [ player4Id, player5Id ],
//         resistanceTeam: [ player1Id, player2Id, player3Id ],
//         numberOfPlayers: 6,
//         roomCreationType: '',
//       },
//       {
//         timeGameFinished: new Date(),
//         winningTeam: 'Spy',
//         spyTeam: [ player5Id, player6Id ],
//         resistanceTeam: [ player4Id, player2Id, player3Id ],
//         numberOfPlayers: 6,
//         roomCreationType: '',
//       },
//       {
//         timeGameFinished: new Date(),
//         winningTeam: 'Resistance',
//         spyTeam: [ player4Id, player5Id ],
//         resistanceTeam: [ player1Id, player2Id, player3Id ],
//         numberOfPlayers: 6,
//         roomCreationType: '',
//       },
//     ], 'findOne');
//   });

//   it('finds the correct games if one user has not played', async () => {
//     const res = await RatingPeriodGameRecord.findOne({
//       winningTeam: 'Spy',
//     });
//     expect(res).toHaveLength(1);
//   });

//   // it('finds the correct games if one user has played some games', () => {
//   //   return RatingPeriodGameRecord.find({
//   //     $or: [{ spyTeam: player1Id }, { resistanceTeam: player1Id }],
//   //   }).then(res => {
//   //     expect(res).toHaveLength(3);
//   //     expect([...res[0].spyTeam, ...res[0].resistanceTeam]).toContain(player1Id)
//   //     expect([...res[1].spyTeam, ...res[1].resistanceTeam]).toContain(player1Id)
//   //     expect([...res[2].spyTeam, ...res[2].resistanceTeam]).toContain(player1Id)
//   //   });
//   // });
// });

// jest.mock('../../models/user');
// jest.mock('../../models/rank');
// jest.mock('../../models/RatingPeriodGameRecord');

// describe('Glicko-2', () => {
//   let glicko2: Glicko2;
//   let user1Id: Types.ObjectId;
//   let user2Id: Types.ObjectId;
//   let user3Id: Types.ObjectId;
//   let user4Id: Types.ObjectId;
//   let user5Id: Types.ObjectId;
//   let user6Id: Types.ObjectId;
//   let user7Id: Types.ObjectId;
//   let user8Id: Types.ObjectId;
//   let games: IRatingPeriodGameRecord[];

//   beforeAll(async () => {
//     jest.clearAllMocks();

//     // Connect to Mongodb
//     const dbLoc =
//       'mongodb://root:password@localhost:27017/proavalon?authSource=admin';
//     await mongoose.connect(dbLoc, {
//       retryWrites: false,
//     });
//     glicko2 = new Glicko2();

//     user1Id = new Types.ObjectId('64562e343eb03ca9ac251655');
//     user2Id = new Types.ObjectId('64562e906fddefa87680cc3f');
//     user3Id = new Types.ObjectId('64562e96ce0da57d19e89002');
//     user4Id = new Types.ObjectId('64562e9d4af24569779941ac');
//     user5Id = new Types.ObjectId('64562ea4d18148c6be4ceeec');
//     user6Id = new Types.ObjectId('64562eaa96d5b620000ea3de');
//     user7Id = new Types.ObjectId('64563ed1cc26b8ffd49cd9f9');
//     user8Id = new Types.ObjectId('64587b6e8a1ea4182899427c');

//     const players = [
//       {
//         _id: user1Id,
//         username: 'player1',
//       },
//       {
//         _id: user2Id,
//         username: 'player2',
//       },
//       {
//         _id: user3Id,
//         username: 'player3',
//       },
//       {
//         _id: user4Id,
//         username: 'player4',
//       },
//       {
//         _id: user5Id,
//         username: 'player5',
//       },
//       {
//         _id: user6Id,
//         username: 'player6',
//       },
//       {
//         _id: user7Id,
//         username: 'player7',
//       },
//       {
//         _id: user8Id,
//         username: 'player8',
//       },
//     ];

//     const ranks = [
//       {
//         userId: user1Id,
//         seasonNumber: 0,
//         playerRating: 1500,
//         rd: 200,
//         volatility: 0.06,
//       },
//       {
//         userId: user2Id,
//         seasonNumber: 0,
//         playerRating: 1700,
//         rd: 170,
//         volatility: 0.06,
//       },
//       {
//         userId: user3Id,
//         seasonNumber: 0,
//         playerRating: 1400,
//         rd: 30,
//         volatility: 0.06,
//       },
//       {
//         userId: user4Id,
//         seasonNumber: 0,
//         playerRating: 1400,
//         rd: 30,
//         volatility: 0.06,
//       },
//       {
//         userId: user5Id,
//         seasonNumber: 0,
//         playerRating: 1400,
//         rd: 30,
//         volatility: 0.06,
//       },
//       {
//         userId: user6Id,
//         seasonNumber: 0,
//         playerRating: 2600,
//         rd: 1110,
//         volatility: 0.06,
//       },
//       {
//         userId: user7Id,
//         seasonNumber: 0,
//         playerRating: 1400,
//         rd: 30,
//         volatility: 0.06,
//       },
//       {
//         userId: user8Id,
//         seasonNumber: 0,
//         playerRating: 1500,
//         rd: 200,
//         volatility: 0.06,
//       },
//     ];

//     games = [
//       {
//         timeGameFinished: new Date(),
//         winningTeam: TeamEnum.SPY,
//         spyTeam: [user1Id, user2Id],
//         resistanceTeam: [user3Id, user4Id, user5Id, user7Id],
//         roomCreationType: '',
//       },
//       {
//         timeGameFinished: new Date(),
//         winningTeam: TeamEnum.SPY,
//         spyTeam: [user2Id, user4Id],
//         resistanceTeam: [user1Id, user3Id, user5Id, user6Id, user7Id],
//         roomCreationType: '',
//       },
//       {
//         timeGameFinished: new Date(),
//         winningTeam: TeamEnum.RESISTANCE,
//         spyTeam: [user1Id, user2Id],
//         resistanceTeam: [user3Id, user4Id, user5Id, user6Id],
//         roomCreationType: '',
//       },
//       {
//         timeGameFinished: new Date(),
//         winningTeam: TeamEnum.RESISTANCE,
//         spyTeam: [user2Id, user3Id],
//         resistanceTeam: [user4Id, user5Id, user6Id, user7Id],
//         roomCreationType: '',
//       },
//       {
//         timeGameFinished: new Date(),
//         winningTeam: TeamEnum.SPY,
//         spyTeam: [user2Id, user3Id],
//         resistanceTeam: [user4Id, user5Id, user6Id, user7Id],
//         roomCreationType: '',
//       },
//       {
//         timeGameFinished: new Date(),
//         winningTeam: TeamEnum.RESISTANCE,
//         spyTeam: [user7Id, user4Id],
//         resistanceTeam: [user5Id, user5Id, user6Id],
//         roomCreationType: '',
//       },
//     ];

//     const userFindMock = User.find as jest.MockedFunction<typeof User.find>;
//     const rankFindMock = Rank.find as jest.MockedFunction<typeof Rank.find>;
//     const ratingPeriodGameRecordFindMock = RatingPeriodGameRecord.find as jest.MockedFunction<typeof RatingPeriodGameRecord.find>;

//     await User.insertMany(players);
//     await Rank.insertMany(ranks);
//     await RatingPeriodGameRecord.insertMany(games);
//   });

//   afterAll(async () => {
//     await User.deleteMany({});
//     await Rank.deleteMany({});
//     await RatingPeriodGameRecord.deleteMany({});
//     mongoose.disconnect();
//   });

//   it('calculates the correct ratings, rd, and volatility for a user after the rating period ends', async () => {
//     await glicko2.updateRatingsByUser(user1Id);
//     const newRank = await Rank.findOne({
//       userId: user1Id,
//       seasonNumber: 1,
//     });

//     expect(newRank.playerRating).toBeCloseTo(1464.05);
//     expect(newRank.rd).toBeCloseTo(151.52);
//     expect(newRank.volatility).toBeCloseTo(0.05999);
//   });

//   it('computes the correct ratings for an inactive player', async () => {
//     const oldRank = await Rank.findOne({
//       userId: user8Id,
//       seasonNumber: 0,
//     });

//     await glicko2.updateRatingsByUser(user8Id);
//     const newRank = await Rank.findOne({
//       userId: user8Id,
//       seasonNumber: 1,
//     });
//     expect(newRank.playerRating).toBe(oldRank.playerRating);
//     expect(newRank.rd).toBeGreaterThan(oldRank.rd);
//     expect(newRank.volatility).toBe(oldRank.volatility);
//   });

//   // it('should update the season number after updating all users', () => {

//   // })
// });
