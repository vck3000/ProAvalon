import { Alliance } from '../../types';
import { Role } from '../types';

class Isolde {
  static role = Role.Isolde;

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.role = Role.Isolde;
    this.alliance = Alliance.Resistance;

    this.description = 'Tristan and Isolde both see each other.';
    this.orderPriorityInOptions = 50;
  }

  see() {
    const roleTag = {};

    for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
      if (this.thisRoom.playersInGame[i].role === Role.Tristan) {
        roleTag[this.thisRoom.playersInGame[i].username] = {};
        roleTag[this.thisRoom.playersInGame[i].username].roleTag = Role.Tristan;
      }
    }

    return roleTag;
  }
}

export default Isolde;
