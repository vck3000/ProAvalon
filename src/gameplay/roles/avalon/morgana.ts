import { Alliance, See } from '../../types';
import { IRole, Role } from '../types';
import Game from '../../game';

class Morgana implements IRole {
  room: Game;

  static role = Role.Morgana;
  role = Role.Morgana;
  alliance = Alliance.Spy;

  description = 'A spy who looks like Merlin to Percival.';
  orderPriorityInOptions = 70;

  specialPhase: string;

  constructor(thisRoom: any) {
    this.room = thisRoom;
  }

  // Morgana sees all spies except oberon
  see(): See {
    if (this.room.gameStarted === true) {
      const spies = [];

      for (let i = 0; i < this.room.playersInGame.length; i++) {
        if (this.room.playersInGame[i].alliance === Alliance.Spy) {
          if (this.room.playersInGame[i].role === Role.Oberon) {
            // don't add oberon
          } else {
            // add the spy
            spies.push(this.room.playersInGame[i].username);
          }
        }
      }

      return { spies, roleTags: {} };
    }
  }

  checkSpecialMove() {}

  getPublicGameData(): any {}
}

export default Morgana;
