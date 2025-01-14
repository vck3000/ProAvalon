import mongoose from 'mongoose';
import { ISeason } from './types/season.types';

// SCHEMA SETUP
const seasonSchema = new mongoose.Schema({
  name: String,
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
});

// compile schema into a model
const Season = mongoose.model<ISeason>('season', seasonSchema);

export default Season;
