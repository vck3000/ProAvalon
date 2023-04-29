import mongoose from 'mongoose';
import type { IRatingPeriodGameRecord } from './types';

const ratingPeriodGameRecordSchema = new mongoose.Schema<IRatingPeriodGameRecord>({
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
const ratingPeriodGameRecord = mongoose.model<IRatingPeriodGameRecord>('ratingPeriodGameRecord', ratingPeriodGameRecordSchema);

export default ratingPeriodGameRecord;
