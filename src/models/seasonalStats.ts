import mongoose from 'mongoose';
import { ISeasonalStat } from './types/seasonalStats';

// SCHEMA SETUP
const seasonalStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  season: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'season',
    required: true,
  },

  rating: {
    type: Number,
    default: 1500, // TODO-kev: Consider if there is an enum to share here
    min: [0, 'Must be greater than or equal to 0, but got {VALUE}.'],
  },
  highestRating: {
    type: Number,
    default: 0,
    min: [0, 'Must be greater than or equal to 0, but got {VALUE}.'],
  },
  ratingBracket: {
    type: String,
    default: 'unranked', // TODO-kev: Consider if there is an enum to share here. Or if this is needed
    enum: [
      'unranked',
      'iron',
      'bronze',
      'silver',
      'gold',
      'platinum',
      'diamond',
      'champion',
    ],
  },

  rankedGamesPlayed: {
    type: Number,
    default: 0,
    min: [0, 'Must be greater than or equal to 0, but got {VALUE}.'], // TODO-kev: Is this necessary if enforced?
  },
  rankedGamesWon: {
    type: Number,
    default: 0,
    min: [0, 'Must be greater than or equal to 0, but got {VALUE}.'], // TODO-kev: Is this necessary if enforced?
  },
  rankedGamesLost: {
    type: Number,
    default: 0,
    min: [0, 'Must be greater than or equal to 0, but got {VALUE}.'], // TODO-kev: Is this necessary if enforced?
  },
  winRate: {
    type: Number,
    default: 0,
    min: [0, 'Must be greater than or equal to 0, but got {VALUE}.'], // TODO-kev: Is this necessary if enforced?
    max: [100, 'Must be less than or equal to 100, but got {VALUE}.'], // TODO-kev: Is this necessary if enforced?
  },

  lastUpdated: {
    type: Date,
    default: new Date(),
  },
});

// compile schema into a model
const SeasonalStats = mongoose.model<ISeasonalStat>(
  'seasonalStats',
  seasonalStatsSchema,
);

export default SeasonalStats;
