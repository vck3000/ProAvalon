import Game from './game';
import { Types } from 'mongoose';

export interface RoleConstructor {
  // @ts-ignore
  new (room: Game): Role;
}

export interface Role {
  // @ts-ignore
  room: Game;
  specialPhase: string;
  role: string;
  alliance: string;
  description: string;
  orderPriorityInOptions: number;

  see(): See;

  checkSpecialMove(): void;

  // TODO
  getPublicGameData(): any;
}

export interface See {
  spies: string[];
}

type Team = 'Resistance' | 'Spy';

export interface Match {
  winningTeam: Team;
  playerTeam: Team;
  opponentTeamRating: number;
  opponentTeamRatingDeviation: number;
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
  ratingDeviation?: number;
  ratingVolatility?: number;
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
}
