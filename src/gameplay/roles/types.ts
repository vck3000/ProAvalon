import Game from '../game';
import { See } from '../types';

export enum Role {
  resistance = 'Resistance',
  spy = 'Spy',

  merlin = 'Merlin',
  assassin = 'Assassin',
  percival = 'Percival',
  morgana = 'Morgana',

  mordred = 'Mordred',
  oberon = 'Oberon',

  tristan = 'Tristan',
  isolde = 'Isolde',
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