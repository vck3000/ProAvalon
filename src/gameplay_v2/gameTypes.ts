export enum Alliance {
  Resistance,
  Spy,
}

export class GameMoveData {
  type: string;
  data: any;
}

export enum Role {
  Resistance,
  Spy,
  Merlin,
  Assassin,
  Isolde,
  Mordred,
  Morgana,
  Oberon,
  Percival,
  Tristan,
}


export enum State {
  Discussion,
  VotingMission,
  VotingTeam,
  AssassinationPhase,
  EndGame,
  SpecialPhase,
}

export enum Round {
  StartingRound,
  Round_2,
  Round_3,
  Round_4,
  FinalRound,
  AnyRound,
}

export enum EndGame{
    SPY_WIN,
    RESISTANCE_WIN,
}