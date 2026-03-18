import { Alliance, See } from '../../types';
import { IRole, Role } from '../types';
import Game from '../../game';

class Galahad implements IRole {
  room: Game;

  static role = Role.Galahad;
  role = Role.Galahad;
  alliance = Alliance.Resistance;

  description = 'Knows the identity of Merlin and the Assassin.';
  orderPriorityInOptions = 79;

  specialPhase: string;

  isBeta = true;

  constructor(thisRoom: any) {
    this.room = thisRoom;
  }

  // Galahad sees Merlin and Assassin
  see(): See {
    const roleTags: Record<string, string> = {};

    for (let i = 0; i < this.room.playersInGame.length; i++) {
      if (
        this.room.playersInGame[i].role === Role.Merlin ||
        this.room.playersInGame[i].role === Role.Assassin
      ) {
        roleTags[
          this.room.anonymizer.anon(this.room.playersInGame[i].username)
        ] = 'Merlin/Assassin?';
      }
    }

    return { spies: [], roleTags };
  }

  checkSpecialMove(): void {}

  getPublicGameData(): any {}
}

export default Galahad;
