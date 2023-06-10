import { Types } from "mongoose";

export interface IRatingPeriodGameRecord {
  timeGameFinished: Date,
  winningTeam: string,
  spyTeam: string[],
  resistanceTeam: string[],
  roomCreationType: string,
}

export interface IRank {
  userId: Types.ObjectId,
  username: string,
  seasonNumber?: number,
  playerRating?: number,
  rd?: number,
  volatility?: number,
}

export interface IUser {
  _id: Types.ObjectId;
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
  currentRanking?: Types.ObjectId;
  pastRankings?: Types.ObjectId[];
  modAction?: Types.ObjectId;
  mutedPlayers?: string[];
  patreonId?: string;
  IPAddresses?: string[];
  lastIPAddress?: string;
}