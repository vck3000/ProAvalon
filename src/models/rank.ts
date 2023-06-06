import mongoose from 'mongoose';
import { eloConstants } from '../elo/constants/eloConstants';
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
    // required: true,
  },
  leavePenalty: {
    type: Number,
    default: 0,
  },
  seasonNumber: {
    type: Number,
  },
  playerRating: {
    type: Number,
    default: eloConstants.DEFAULT_RATING,
  },
  rd: {
    type: Number,
    default: eloConstants.DEFAULT_RD,
  },
  volatility: {
    type: Number,
    default: eloConstants.DEFAULT_VOL,
  },
});

const rank = mongoose.model<IRank>('rank', rankSchema);

export default rank;