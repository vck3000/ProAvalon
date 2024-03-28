import { Alliance, See } from '../../types';
import { IRole, Role } from '../types';
import Game from '../../game';

class Tristan implements IRole {
  room: Game;
  static role = Role.Tristan;
  role = Role.Tristan;
  alliance = Alliance.Resistance;

  description = 'Tristan and Isolde both see each other.';
  orderPriorityInOptions = 50;

  specialPhase: string;

  constructor(thisRoom: any) {
    this.room = thisRoom;
  }

  see(): See {
    const roleTags: Record<string, string> = {};

    for (let i = 0; i < this.room.playersInGame.length; i++) {
      if (this.room.playersInGame[i].role === Role.Isolde) {
        roleTags[
          this.room.anonymizer.anon(this.room.playersInGame[i].username)
        ] = Role.Isolde;
      }
    }

    return { spies: [], roleTags };
  }

  checkSpecialMove(): void {}

  getPublicGameData(): any {}
}

export default Tristan;
