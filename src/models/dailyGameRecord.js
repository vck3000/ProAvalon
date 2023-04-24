import mongoose from 'mongoose';

// SCHEMA SETUP
const dailyGameRecordSchema = new mongoose.Schema({
  timeGameStarted: Date,
  timeAssassinationStarted: Date,
  timeGameFinished: Date,
  winningTeam: String,
  spyTeam: [String],
  resistanceTeam: [String],

  gameMode: String,
  botUsernames: [String],

  playerUsernamesOrdered: [String],
  playerUsernamesOrderedReversed: [String],

  numberOfPlayers: Number,
  howTheGameWasWon: String,
  whoAssassinShot: String,
  whoAssassinShot2: String,

  roles: [String],
  cards: [String],

  ladyChain: [String],
  ladyHistoryUsernames: [String],

  refChain: [String],
  refHistoryUsernames: [String],

  sireChain: [String],
  sireHistoryUsernames: [String],

  missionHistory: [String],
  numFailsHistory: [Number],
  voteHistory: Object,
  playerRoles: Object,
});

dailyGameRecordSchema.index({ timeGameFinished: 1 });
// compile schema into a model
const dailyGameRecord = mongoose.model('dailyGameRecord', dailyGameRecordSchema);

export default dailyGameRecord;
