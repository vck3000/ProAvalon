import { Alliance } from '../../types';

class Isolde {
  static role = 'Isolde';
  static alliance = Alliance.Resistance;

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.role = 'Isolde';
    this.alliance = Alliance.Resistance;

    this.description = 'Tristan and Isolde both see each other.';
    this.orderPriorityInOptions = 50;
  }

  see() {
    const roleTag = {};

    for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
      if (this.thisRoom.playersInGame[i].role === 'Tristan') {
        roleTag[this.thisRoom.playersInGame[i].username] = {};
        roleTag[this.thisRoom.playersInGame[i].username].roleTag = 'Tristan';
      }
    }

    return roleTag;
  }
}

export default Isolde;
