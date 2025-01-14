import mongoose from 'mongoose';

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
  },
  highestRating: {
    type: Number,
    default: 1500, // TODO-kev: Consider if there is an enum to share here
  },
  ratingBracket: {
    type: String,
    default: 'silver', // TODO-kev: Consider if there is an enum to share here. Or if this is needed
  },

  rankedGamesPlayed: {
    type: Number,
    default: 0,
  },
  rankedGamesWon: {
    type: Number,
    default: 0,
  },
  rankedGamesLost: {
    type: Number,
    default: 0,
  },
  winRate: {
    type: Number,
    default: 0,
  },

  lastUpdated: {
    type: Date,
    required: true,
  },
});

// compile schema into a model
const SeasonalStats = mongoose.model('seasonalStats', seasonalStatsSchema);

export default SeasonalStats;
