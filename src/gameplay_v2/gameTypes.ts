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

export enum Round {
  StartingRound,
  Round_2,
  Round_3,
  Round_4,
  FinalRound,
  AnyRound,
}

export enum FinalState{
    SPY_WIN,
    RESISTANCE_WIN,
}