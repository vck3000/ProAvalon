import mongoose from 'mongoose';
import { IUserSeasonStat } from './types/userSeasonStat';

// SCHEMA SETUP
const userSeasonStatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  seasonId: {
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
  winRate: {
    type: Number,
    default: 0,
    min: [0, 'Must be greater than or equal to 0, but got {VALUE}.'], // TODO-kev: Is this necessary if enforced?
    max: [100, 'Must be less than or equal to 100, but got {VALUE}.'], // TODO-kev: Is this necessary if enforced?
  },

  // roleStats: {
  //   type: Map,
  //   of: {
  //     gamesWon: {
  //       type: Number,
  //       default: 0,
  //       min: [0, 'Must be greater than or equal to 0, but got {VALUE}.'],
  //     },
  //     gamesLost: {
  //       type: Number,
  //       default: 0,
  //       min: [0, 'Must be greater than or equal to 0, but got {VALUE}.'],
  //     },
  //     _id: false,
  //   },
  //   required: true,
  // },

  roleStats: {
    type: Object,
    required: true,
    validate: {
      validator: function (value: any) {
        for (const key in value) {
          if (value.hasOwnProperty(key)) {
            const roleStat = value[key];
            if (
              typeof roleStat.gamesWon !== 'number' ||
              roleStat.gamesWon < 0
            ) {
              return false;
            }
            if (
              typeof roleStat.gamesLost !== 'number' ||
              roleStat.gamesLost < 0
            ) {
              return false;
            }
          }
        }
        return true;
      },
      message: 'Invalid roleStats format received.',
    },
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
