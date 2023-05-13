import { Types, Model } from "mongoose";
import User from './user';

export interface IRatingPeriodGameRecord {
  timeGameFinished: Date,
  winningTeam: string,
  spyTeam: Types.ObjectId[],
  resistanceTeam: Types.ObjectId[],
  roomCreationType: string,
}

export interface IRank {
  _id?: Types.ObjectId,
  userId: Types.ObjectId,
  seasonNumber?: number,
  playerRating?: number,
  rd?: number,
  volatility?: number,
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
  currentRanking?: Types.ObjectId;
  pastRankings?: Types.ObjectId[];
  modAction?: Types.ObjectId;
  mutedPlayers?: string[];
  patreonId?: string;
  IPAddresses?: string[];
  lastIPAddress?: string;
}