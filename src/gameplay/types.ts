import Game from './game';

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
