import { Alliance } from '../../types';
import { Role } from '../types';

class Tristan {
  static role = Role.Tristan;

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.role = Role.Tristan;
    this.alliance = Alliance.Resistance;

    this.description = 'Tristan and Isolde both see each other.';
    this.orderPriorityInOptions = 50;
  }

  see() {
    const roleTag = {};

    for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
      if (this.thisRoom.playersInGame[i].role === Role.Isolde) {
        roleTag[this.thisRoom.playersInGame[i].username] = {};
        roleTag[this.thisRoom.playersInGame[i].username].roleTag = Role.Isolde;
      }
    }

    return roleTag;
  }
}

export default Tristan;
