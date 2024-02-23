import { Alliance } from '../../types';
import { Role } from '../types';

class Oberon {
  static role = Role.Oberon;

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.role = Role.Oberon;
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
        if (this.thisRoom.playersInGame[i].role === Role.Oberon) {
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
