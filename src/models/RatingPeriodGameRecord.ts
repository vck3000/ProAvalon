import mongoose from 'mongoose';
import type { IRatingPeriodGameRecord } from './types';

const ratingPeriodGameRecordSchema = new mongoose.Schema<IRatingPeriodGameRecord>({
  timeGameFinished: Date,
  winningTeam: String,
  spyTeam: [String],
  resistanceTeam: [String],
  roomCreationType: String,
});

// compile schema into a model
const ratingPeriodGameRecord = mongoose.model<IRatingPeriodGameRecord>('ratingPeriodGameRecord', ratingPeriodGameRecordSchema);

export default ratingPeriodGameRecord;
