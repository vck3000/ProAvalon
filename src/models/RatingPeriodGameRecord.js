import mongoose from 'mongoose';

const ratingPeriodGameRecordSchema = new mongoose.Schema({
  timeGameFinished: Date,
  winningTeam: String,
  spyTeam: [String],
  resistanceTeam: [String],
  roomCreationType: String,
});

// compile schema into a model
const ratingPeriodGameRecord = mongoose.model('ratingPeriodGameRecord', ratingPeriodGameRecordSchema);

export default ratingPeriodGameRecord;
