import mongoose from 'mongoose';
import type { IRatingPeriodGameRecord } from './types';

const ratingPeriodGameRecordSchema = new mongoose.Schema<IRatingPeriodGameRecord>({
  timeGameFinished: Date,
  winningTeam: String,
  spyTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  resistanceTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  roomCreationType: String,
});

// compile schema into a model
const ratingPeriodGameRecord = mongoose.model<IRatingPeriodGameRecord>('ratingPeriodGameRecord', ratingPeriodGameRecordSchema);

export default ratingPeriodGameRecord;
