import Game from './game';
import mongoose, { Types, Schema } from 'mongoose';

export interface RoleConstructor {
  // @ts-ignore
  new (room: Game): Role;
}

export interface Role {
  // @ts-ignore
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

export interface See {
  spies: string[];
}

export enum TeamEnum {
  RESISTANCE = 'Resistance',
  SPY = 'Spy',
}

export enum OutcomeEnum {
  WIN = 1,
  LOSE = 0,
}
