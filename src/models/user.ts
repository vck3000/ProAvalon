import mongoose from 'mongoose';
// @ts-ignore
import passportLocalMongoose from 'passport-local-mongoose';
import type { IUser } from '../gameplay/gameEngine/types';

const UserSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
  },
  usernameLower: String,
  password: {
    type: String,
    // Not sure exactly how passportjs handles this,
    // but we don't give this parameter to Mongoose when creating.
    // required: true,
  },

  emailAddress: String,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  // I've decided it is ok to not have these email tokens expire.
  emailToken: String,
  emailTokenExpiry: Date,

  avatarImgRes: {
    type: String,
    default: null,
  },
  avatarImgSpy: {
    type: String,
    default: null,
  },
  lastApprovedAvatarDate: Date,
  avatarLibrary: [Number],
  avatarHide: Boolean,

  hideStats: Boolean,

  pronoun: {
    type: String,
    default: null,
  },

  dateJoined: Date,

  // Oldest entries at the front. Latest at the end.
  lastLoggedIn: [Date],
  lastLoggedInDateMetric: Date,

  totalTimePlayed: {
    type: Date,
    default: 0,
  },

  totalGamesPlayed: {
    type: Number,
    default: 0,
  },
  totalRankedGamesPlayed: {
    type: Number,
    default: 0,
  },

  totalWins: {
    type: Number,
    default: 0,
  },
  totalResWins: {
    type: Number,
    default: 0,
  },
  totalLosses: {
    type: Number,
    default: 0,
  },
  totalResLosses: {
    type: Number,
    default: 0,
  },

  playerRating: {
    // currently elo, possible change in future
    type: Number,
    default: 1500,
  },
  ratingBracket: {
    type: String,
    default: 'silver',
  },

  winsLossesGameSizeBreakdown: {
    type: Object,
    default: {},
  },

  nationality: {
    type: String,
    default: '',
  },
  nationCode: {
    type: String,
    default: '',
  },
  timeZone: {
    type: String,
    default: '',
  },
  biography: {
    type: String,
    default: '',
  },

  // dont need to worry about roleWins growing out of control
  // since there are a limited amount of roles, and each role
  // only has one Number attached to it
  roleStats: {
    type: Object,
    default: {},
  },

  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'notification',
    },
  ],

  expiredPatreonNotification: Boolean,

  modAction: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ModAction',
    },
  ],

  mutedPlayers: [String],

  IPAddresses: [String],
  lastIPAddress: String,

  matchmakingBlacklist: [String],
});

UserSchema.plugin(passportLocalMongoose, {
  usernameCaseInsensitive: true,
});

export interface UserDocument extends mongoose.Document {
  username: string;
  usernameLower: string;
}

export default mongoose.model<IUser>('User', UserSchema);
