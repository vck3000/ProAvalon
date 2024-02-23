import Game from './game';
import { Types } from 'mongoose';

export enum Alliance {
  Resistance = 'Resistance',
  Spy = 'Spy',
}

export interface RoleConstructor {
  // @ts-ignore
  new (room: Game): Role;
}

export interface See {
  spies: string[];
}

export interface IUser {
  username: string;
  usernameLower?: string;
  password?: string;
  emailAddress?: string;
  emailVerified?: boolean;
  emailToken?: string;
  avatarImgRes?: string | null;
  avatarImgSpy?: string | null;
  avatarHide?: boolean;
  hideStats?: boolean;
  pronoun?: string | null;
  dateJoined?: Date;
  lastLoggedIn?: Date[];
  totalTimePlayed?: Date | number;
  totalGamesPlayed?: number;
  totalRankedGamesPlayed?: number;
  totalWins?: number;
  totalResWins?: number;
  totalLosses?: number;
  totalResLosses?: number;
  playerRating?: number;
  ratingBracket?: string;
  winsLossesGameSizeBreakdown?: Record<string, unknown>;
  nationality?: string;
  nationCode?: string;
  timeZone?: string;
  biography?: string;
  roleStats?: Record<string, unknown>;
  notifications?: Types.ObjectId;
  modAction?: Types.ObjectId;
  mutedPlayers?: string[];
  patreonId?: string;
  IPAddresses?: string[];
  lastIPAddress?: string;
  matchmakingBlacklist?: string[];
}
