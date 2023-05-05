import mongoose from 'mongoose';
import eloConstants from '../elo/constants/eloConstants';
import { IRank } from './types';

// SCHEMA SETUP
const rankSchema = new mongoose.Schema<IRank>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  seasonNumber: {
    type: Number,
  },
  playerRating: {
    type: Number,
    default: eloConstants.DEFAULTRATING,
  },
  rd: {
    type: Number,
    default: eloConstants.DEFAULTRD,
  },
  volatility: {
    type: Number,
    default: eloConstants.DEFAULTVOL,
  },
});
// compile schema into a model
const rank = mongoose.model<IRank>('rank', rankSchema);

export default rank;
