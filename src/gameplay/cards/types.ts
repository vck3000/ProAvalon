import { SocketUser } from '../../sockets/types';

export enum Card {
  LadyOfTheLake = 'Lady of the Lake',
  RefOfTheRain = 'Ref of the Rain',
  SireOfTheSea = 'Sire of the Sea',
}

export interface ICard {
  card: Card;

  initialise(): void;

  setHolder(index: number): void;

  // Does a phase transition if conditions are met.
  checkSpecialMove(
    socket: SocketUser,
    buttonPressed: 'yes' | 'no',
    selectedPlayers: string[],
  ): boolean;

  getPublicGameData(): any;
}
