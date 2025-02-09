import mongoose from 'mongoose';
import { IUserSeasonStat } from './types/userSeasonStat';
import { DEFAULT_RATING } from '../gameplay/elo/ratings';

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
    default: DEFAULT_RATING,
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

  roleStats: {
    type: Object,
    default: {},
    validate: {
      validator: function (value: any) {
        for (const playerCount in value) {
          if (value.hasOwnProperty(playerCount)) {
            const roleStatsMap = value[playerCount];

            for (const role in roleStatsMap) {
              if (roleStatsMap.hasOwnProperty(role)) {
                const roleStat = roleStatsMap[role];

                if (
                  typeof roleStat.gamesPlayed !== 'number' ||
                  roleStat.gamesPlayed < 0 ||
                  typeof roleStat.gamesWon !== 'number' ||
                  roleStat.gamesWon < 0
                ) {
                  return false;
                }
              }
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
