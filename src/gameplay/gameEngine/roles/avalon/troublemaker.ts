import { Alliance, See } from '../../types';
import { IRole, Role } from '../types';
import Game from '../../game';

class Troublemaker implements IRole {
  room: Game;

  static role = Role.Troublemaker;
  role = Role.Troublemaker;

  alliance = Alliance.Resistance;

  description =
    'The Troublemaker is on the side of Good. They must lie when their loyalty is checked by the Lady of the Lake, Ref of the Rain, Sire of the Sea, or any ability that checks loyalty — appearing as Evil.';
  orderPriorityInOptions = 76;

  specialPhase: string;

  isBeta = true;

  constructor(thisRoom: any) {
    this.room = thisRoom;
  }

  see(): See {
    return { spies: [], roleTags: {} };
  }

  checkSpecialMove(): void {}

  getPublicGameData(): any {}
}

export default Troublemaker;
