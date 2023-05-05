import { Types } from "mongoose";

export interface IRatingPeriodGameRecord {
  timeGameStarted: Date,
  timeGameFinished: Date,
  winningTeam: string,
  spyTeam: Types.ObjectId[],
  resistanceTeam: Types.ObjectId[],

  numberOfPlayers: number,
  roomCreationType: string,

  // For testing only
  avgRating: number,
  avgRd: number,
}
