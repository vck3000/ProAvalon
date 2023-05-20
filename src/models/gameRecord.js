import mongoose from 'mongoose';

// SCHEMA SETUP
const gameRecordSchema = new mongoose.Schema({
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
  roomCreationType: String,
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
  disableVoteHistory: Boolean,
  playerRoles: Object,
});

gameRecordSchema.index({ timeGameFinished: 1 });
// compile schema into a model
const gameRecord = mongoose.model('gameRecord', gameRecordSchema);

export default gameRecord;
