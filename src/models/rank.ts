import mongoose from 'mongoose';
import { IRank } from './types';

// SCHEMA SETUP
const rankSchema = new mongoose.Schema<IRank>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  username: {
    type: String,
    ref: 'user',
    required: true,
  },
  seasonNumber: {
    type: Number,
  },
  playerRating: {
    type: Number,
    default: 1500,
  },
  rd: {
    type: Number,
    default: 350,
  },
  volatility: {
    type: Number,
    default: 0.06,
  },
});

const rank = mongoose.model<IRank>('rank', rankSchema);

export default rank;
