import { Alliance } from '../../types';
import { Role } from '../types';

class Resistance {
  static role = Role.Resistance;

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.role = Role.Resistance;
    this.alliance = Alliance.Resistance;

    this.description = 'A standard Resistance member.';
  }

  see() {
    return undefined;
  }

  checkSpecialMove() {}
}

export default Resistance;
