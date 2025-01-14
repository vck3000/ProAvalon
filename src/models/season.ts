import mongoose from 'mongoose';
import { ISeason } from './types/season.types';

// SCHEMA SETUP
const seasonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

// compile schema into a model
const Season = mongoose.model<ISeason>('season', seasonSchema);

export default Season;
