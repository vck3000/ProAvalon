import { Alliance, See } from '../../types';
import { IRole, Role } from '../types';
import Game from '../../game';

class Isolde implements IRole {
  room: Game;
  specialPhase: string;

  static role = Role.Isolde;
  role = Role.Isolde;
  alliance = Alliance.Resistance;
  description = 'Tristan and Isolde both see each other.';
  orderPriorityInOptions = 50;

  constructor(thisRoom: any) {
    this.room = thisRoom;
  }

  see(): See {
    const roleTags: Record<string, string> = {};

    for (let i = 0; i < this.room.playersInGame.length; i++) {
      if (this.room.playersInGame[i].role === Role.Tristan) {
        roleTags[
          this.room.anonymizer.anon(this.room.playersInGame[i].username)
        ] = Role.Tristan;
      }
    }

    return { spies: [], roleTags };
  }

  checkSpecialMove(): void {}

  getPublicGameData(): any {}
}

export default Isolde;
