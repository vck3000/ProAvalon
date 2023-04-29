export interface IRatingPeriodGameRecord {
  timeGameStarted: Date,
  timeGameFinished: Date,
  winningTeam: string,
  spyTeam: string[],
  resistanceTeam: string[],

  numberOfPlayers: number,
  roomCreationType: string,
}
