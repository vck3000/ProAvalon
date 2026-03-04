import { Alliance, See } from '../../types';
import { IRole, Role } from '../types';
import Game from '../../game';
import { Card } from '../../cards/types';

class Spy implements IRole {
  room: Game;

  static role = Role.Spy;
  role = Role.Spy;

  alliance = Alliance.Spy;

  description = 'A standard Spy member.';

  orderPriorityInOptions: number;
  specialPhase: string;

  constructor(thisRoom: any) {
    this.room = thisRoom;
  }

  // Spy sees all spies except oberon
  see(): See {
  const roleTags: Record<string, string> = {};
  
    if (this.room.gameStarted === true) {
      const spies = [];

      for (let i = 0; i < this.room.playersInGame.length; i++) {
        if (this.room.playersInGame[i].alliance === Alliance.Spy
          || i === this.room.specialCards[Card.Norebo].indexOfPlayerHolding) {
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

export default Spy;
