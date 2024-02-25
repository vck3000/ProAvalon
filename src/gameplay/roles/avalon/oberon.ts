import { Alliance, See } from '../../types';
import { IRole, Role } from '../types';
import Game from '../../game';

class Oberon implements IRole {
  room: Game;

  static role = Role.Oberon;
  role = Role.Oberon;
  alliance = Alliance.Spy;

  description = 'Oberon and Spies do not know each other.';
  orderPriorityInOptions = 50;

  specialPhase: string;

  constructor(thisRoom: any) {
    this.room = thisRoom;
  }

  // Oberon only sees him/herself
  see(): See {
    if (this.room.gameStarted === true) {
      const spies = [];

      for (let i = 0; i < this.room.playersInGame.length; i++) {
        if (this.room.playersInGame[i].role === Role.Oberon) {
          spies.push(this.room.playersInGame[i].username);
          break;
        }
      }

      return { spies, roleTags: {} };
    }
  }

  checkSpecialMove() {}

  getPublicGameData(): any {}
}

export default Oberon;
