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
  totalWins: {
    type: Number,
    default: 0,
  },
});

// compile schema into a model
const SeasonalStats = mongoose.model('seasonalStats', seasonalStatsSchema);

export default SeasonalStats;
