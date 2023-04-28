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
  //add more if you wish to
}

export enum Round {
  StartingRound,
  Round_2,
  Round_3,
  Round_4,
  FinalRound,
}