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
  const roleTags: Record<string, string> = {};
  
    if (this.room.gameStarted === true) {
      const spies = [];

      for (let i = 0; i < this.room.playersInGame.length; i++) {
        if (this.room.playersInGame[i].alliance === Alliance.Spy) {
          if (this.room.playersInGame[i].role === Role.Oberon) {
            // don't add oberon
          } else {
            // add the spy
            spies.push(
              this.room.anonymizer.anon(this.room.playersInGame[i].username),
            );
            if (this.room.playersInGame[i].role == Role.Hitberon) {
              roleTags[
                this.room.anonymizer.anon(this.room.playersInGame[i].username)
              ] = 'Hitberon';
            }
          }
        }
      }
      return { spies, roleTags };
    }
  }

  checkSpecialMove() {}

  getPublicGameData(): any {}
}

export default Morgana;
