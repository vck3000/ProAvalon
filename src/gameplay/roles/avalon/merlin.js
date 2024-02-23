import { Alliance } from '../../types';
import { Role } from '../types';

class Merlin {
  static role = Role.merlin;
  role = Role.merlin;

  static alliance = Alliance.Resistance;

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.alliance = Alliance.Resistance;

    this.description = 'Knows the identity of the spies.';
    this.orderPriorityInOptions = 100;
  }

  see() {
    if (this.thisRoom.gameStarted === true) {
      const obj = {};

      const array = [];

      for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
        if (this.thisRoom.playersInGame[i].alliance === Alliance.Spy) {
          if (this.thisRoom.playersInGame[i].role === 'Mordred') {
            // don't add mordred for Merlin to see
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

  checkSpecialMove() {
    // Merlin has no special move
    // To be honest, Merlin seeing the spies can be considered a "Special Move"
    // If we were to put that into here, in the startGame() function in the game.js file
    // Run all the role special moves once, and here, forcefully change the
    // see variable of the merlin's data object which will be sent to him.
  }
}

export default Merlin;
