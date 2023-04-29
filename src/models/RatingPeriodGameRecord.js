import mongoose from 'mongoose';

const ratingPeriodGameRecordSchema = new mongoose.Schema({
  timeGameStarted: Date,
  timeGameFinished: Date,
  winningTeam: String,
  spyTeam: [String],
  resistanceTeam: [String],

  numberOfPlayers: Number,
  roomCreationType: String,
});

ratingPeriodGameRecordSchema.index({ timeGameFinished: 1 });
// compile schema into a model
const ratingPeriodGameRecord = mongoose.model('ratingPeriodGameRecord', ratingPeriodGameRecordSchema);

export default ratingPeriodGameRecord;
