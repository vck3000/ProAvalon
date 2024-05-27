import Game from './game';
import { Types } from 'mongoose';

export interface RecoverEntry {
  name: RecoverableComponent;
  data: string;
}

export enum RecoverableComponent {
  Anonymizer = 'Anonymizer',
  a = 'a',
}

export interface IRecoverable {
  name: RecoverableComponent;
  serialise(): string;

  recover(data: string): void;
}

export enum Alliance {
  Resistance = 'Resistance',
  Spy = 'Spy',
}

export interface RoleConstructor {
  // @ts-expect-error Cannot find name 'Role'.
  new (room: Game): Role;
}

export interface See {
  spies: string[];
  roleTags: Record<string, string>; // Username, tag
}

export interface IUser {
  username: string;
  usernameLower?: string;
  password?: string;
  emailAddress?: string;
  emailVerified?: boolean;
  emailToken?: string;
  emailTokenExpiry?: Date;
  avatarImgRes?: string | null;
  avatarImgSpy?: string | null;
  avatarLibrary?: number[];
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
  expiredPatreonNotification?: boolean;
  modAction?: Types.ObjectId;
  mutedPlayers?: string[];
  IPAddresses?: string[];
  lastIPAddress?: string;
  matchmakingBlacklist?: string[];

  save: () => Promise<void>;
  markModified: (path: string) => void;
}

export type RoomPlayer = {
  username: string;
  anonUsername?: string;
  avatarImgRes: string;
  avatarImgSpy: string;
  avatarHide: boolean;
  claim: boolean;
};
