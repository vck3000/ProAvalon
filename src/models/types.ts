import { Types } from "mongoose";

export interface IRatingPeriodGameRecord {
  timeGameFinished: Date,
  winningTeam: string,
  spyTeam: Types.ObjectId[],
  resistanceTeam: Types.ObjectId[],
  roomCreationType: string,
}

export interface IRank {
  userId: Types.ObjectId,
  seasonNumber?: number,
  playerRating?: number,
  rd?: number,
  volatility?: number,
}
