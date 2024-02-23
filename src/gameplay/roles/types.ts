import Game from '../game';
import { See } from '../types';

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
}

export interface IRole {
  room: Game;
  specialPhase: string;
  role: string;
  alliance: string;
  description: string;
  orderPriorityInOptions: number;

  see(): See;

  checkSpecialMove(): void;

  // TODO
  getPublicGameData(): any;
}