import mongoose from 'mongoose';

const gameRatingRecordSchema = new mongoose.Schema({
  timeGameStarted: Date,
  timeGameFinished: Date,
  winningTeam: String,
  spyTeam: [String],
  resistanceTeam: [String],

  playerUsernamesOrdered: [String],
  playerUsernamesOrderedReversed: [String],

  numberOfPlayers: Number,
  roomCreationType: String,
});

gameRatingRecordSchema.index({ timeGameFinished: 1 });
// compile schema into a model
const gameRatingRecord = mongoose.model('gameRatingRecord', gameRatingRecordSchema);

export default gameRatingRecord;
