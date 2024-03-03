import { Alliance, See } from '../../types';
import { IRole, Role } from '../types';
import Game from '../../game';

class Percival implements IRole {
  room: Game;

  static role = Role.Percival;
  role = Role.Percival;
  alliance = Alliance.Resistance;

  description = 'Knows the identity of Merlin and Morgana.';
  orderPriorityInOptions = 80;

  specialPhase: string;

  constructor(thisRoom: any) {
    this.room = thisRoom;
  }

  // Percival sees Merlin and Morgana
  see(): See {
    const roleTags: Record<string, string> = {};

    for (let i = 0; i < this.room.playersInGame.length; i++) {
      if (
        this.room.playersInGame[i].role === Role.Merlin ||
        this.room.playersInGame[i].role === Role.Morgana
      ) {
        roleTags[this.room.playersInGame[i].username] = 'Merlin?';
      }
    }

    return { spies: [], roleTags };
  }

  checkSpecialMove(): void {}

  getPublicGameData(): any {}
}

export default Percival;
