import { Alliance } from '../../types';

class Tristan {
  static role = Role.tristan;

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.role = Role.tristan;
    this.alliance = Alliance.Resistance;

    this.description = 'Tristan and Isolde both see each other.';
    this.orderPriorityInOptions = 50;
  }

  see() {
    const roleTag = {};

    for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
      if (this.thisRoom.playersInGame[i].role === Role.isolde) {
        roleTag[this.thisRoom.playersInGame[i].username] = {};
        roleTag[this.thisRoom.playersInGame[i].username].roleTag = Role.isolde;
      }
    }

    return roleTag;
  }
}

export default Tristan;
