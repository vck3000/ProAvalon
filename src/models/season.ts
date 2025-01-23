import mongoose from 'mongoose';
import { ISeason } from './types/season';

// SCHEMA SETUP
const seasonSchema = new mongoose.Schema({
  seasonCounter: {
    type: Number,
    required: true,
    unique: true,
  },
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

  ratingBrackets: {
    type: [
      {
        name: {
          type: String,
          required: true,
        },
        min: {
          type: Number,
          required: true,
          min: [0, 'Must be 0 or higher, got {VALUE}'],
        },
        max: {
          type: Number,
          required: true,
          min: [0, 'Must be 0 or higher, got {VALUE}'],
        },
      },
    ],
    required: true,
    _id: false,
  },
});

// compile schema into a model
const Season = mongoose.model<ISeason>('season', seasonSchema);

export default Season;
