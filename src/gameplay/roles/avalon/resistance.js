import { Alliance } from '../../types';

class Resistance {
  static role = 'Resistance';

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.role = 'Resistance';
    this.alliance = Alliance.Resistance;

    this.description = 'A standard Resistance member.';
  }

  see() {
    return undefined;
  }

  checkSpecialMove() {}
}

export default Resistance;
