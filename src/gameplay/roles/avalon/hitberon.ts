import { Alliance, See } from '../../types';
import { IRole, Role } from '../types';
import Game from '../../game';

class Hitberon implements IRole {
  room: Game;

  static role = Role.Hitberon;
  role = Role.Hitberon;
  alliance = Alliance.Spy;

  description = "Hitberon doesn't know the Spies, but the Spies know Hitberon.";
  orderPriorityInOptions = 50;

  specialPhase: string;

  constructor(thisRoom: any) {
    this.room = thisRoom;
  }

  // Hitberon only sees him/herself
  see(): See {
    if (this.room.gameStarted === true) {
      const spies = [];

      for (let i = 0; i < this.room.playersInGame.length; i++) {
        if (this.room.playersInGame[i].role === Role.Hitberon) {
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

export default Hitberon;
