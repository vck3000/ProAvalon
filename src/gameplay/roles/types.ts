import Game from '../game';
import { Alliance, See } from '../types';

export enum Role {
  Resistance = 'Resistance',
  Spy = 'Spy',

  Merlin = 'Merlin',
  Assassin = 'Assassin',
  Percival = 'Percival',
  Morgana = 'Morgana',

  Mordred = 'Mordred',
  Oberon = 'Oberon',

  Tristan = 'Tristan',
  Isolde = 'Isolde',

  MordredAssassin = 'MordredAssassin',
  Hitberon = 'Hitberon',
}

export interface IRole {
  room: Game; // TODO this should probs be removed and a constructor interface added
  specialPhase: string; // TODO see if we really need this.
  role: string;
  alliance: string;
  description: string;
  orderPriorityInOptions: number;

  see(): See;

  checkSpecialMove(): void;

  // TODO do we need this?
  getPublicGameData(): any;
}

// TODO-kev: Consider how to incorporate this into the above
export interface ISeasonRole {
  name: string;
  alliance: Alliance;
}
