import { Alliance } from '../../types';
import { Role } from '../types';

class Spy {
  static role = Role.Spy;
  role = Role.Spy;

  alliance = Alliance.Spy;

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.description = 'A standard Spy member.';
  }

  // Spy sees all spies except oberon
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

export default Spy;