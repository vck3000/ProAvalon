import { Alliance } from '../../types';
import { Role } from '../types';

class Oberon {
  static role = Role.oberon;

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.role = Role.oberon;
    this.alliance = Alliance.Spy;

    this.description = 'Oberon and Spies do not know each other.';
    this.orderPriorityInOptions = 50;
  }

  // Oberon only sees him/herself
  see() {
    if (this.thisRoom.gameStarted === true) {
      const obj = {};
      const array = [];

      for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
        if (this.thisRoom.playersInGame[i].role === Role.oberon) {
          array.push(this.thisRoom.playersInGame[i].username);
          break;
        }
      }

      obj.spies = array;
      return obj;
    }
  }

  checkSpecialMove() {}
}

export default Oberon;
