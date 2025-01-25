import mongoose from 'mongoose';
import { IUserSeasonStat } from './types/userSeasonStat';

// SCHEMA SETUP
const userSeasonStatSchema = new mongoose.Schema({
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
    default: 'unranked',
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
const UserSeasonStat = mongoose.model<IUserSeasonStat>(
  'userSeasonStat',
  userSeasonStatSchema,
);

export default UserSeasonStat;
