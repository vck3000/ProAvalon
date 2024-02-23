import { Alliance } from '../../types';
import { Role } from '../types';

class Mordred {
  static role = Role.Mordred;

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.role = Role.Mordred;
    this.alliance = Alliance.Spy;

    this.description = 'A spy who is invisible to Merlin.';
    this.orderPriorityInOptions = 60;
  }

  // Morded sees all spies except oberon
  see() {
    if (this.thisRoom.gameStarted === true) {
      const obj = {};
      const array = [];

      for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
        if (this.thisRoom.playersInGame[i].alliance === Alliance.Spy) {
          if (this.thisRoom.playersInGame[i].role === Role.Oberon) {
            // don't add oberon
          } else {
            // add the spy
            array.push(this.thisRoom.playersInGame[i].username);
          }
        }
      }

      obj.spies = array;
      return obj;
    }
  }

  checkSpecialMove() {}
}

export default Mordred;
