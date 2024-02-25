import { Alliance, See } from '../../types';
import { IRole, Role } from '../types';
import Game from '../../game';

class Resistance implements IRole {
  room: Game;

  static role = Role.Resistance;

  role = Role.Resistance;
  alliance = Alliance.Resistance;

  description = 'A standard Resistance member.';

  orderPriorityInOptions: number;
  specialPhase: string;

  constructor(thisRoom: any) {
    this.room = thisRoom;
  }

  see(): See {
    return { spies: [], roleTags: {} };
  }

  checkSpecialMove() {}

  getPublicGameData(): any {}
}

export default Resistance;
