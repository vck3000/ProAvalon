import { Alliance, See } from '../../types';
import { IRole, Role } from '../types';
import Game from '../../game';

class Merlin implements IRole {
  room: Game;

  static role = Role.Merlin;
  role = Role.Merlin;

  alliance = Alliance.Resistance;

  description = 'Knows the identity of the spies.';
  orderPriorityInOptions = 100;

  specialPhase: string;

  constructor(thisRoom: any) {
    this.room = thisRoom;
  }

  see(): See {
          const roleTags: Record<string, string> = {};

    if (this.room.gameStarted === true) {
      const spies = [];

      let melronExists: Boolean = false;
      for (let i = 0; i < this.room.playersInGame.length; i++)
      {
        if(this.room.playersInGame[i].role === Role.Melron){
            melronExists = true;
          break;
        }
        else continue;
      }

      for (let i = 0; i < this.room.playersInGame.length; i++) {
        if(this.room.playersInGame[i].role === this.role) {     
        roleTags[
          this.room.anonymizer.anon(this.room.playersInGame[i].username)
        ] = melronExists ? "Merlin?" : this.role;
      }
        if (this.room.playersInGame[i].alliance === Alliance.Spy) {
          if (
            this.room.playersInGame[i].role === Role.Mordred ||
            this.room.playersInGame[i].role === Role.MordredAssassin
          ) {
            continue;
          }

          spies.push(
            this.room.anonymizer.anon(this.room.playersInGame[i].username),
          );
        }
      }

      return { spies, roleTags };
    }
  }

  checkSpecialMove() {
    // Merlin has no special move
    // To be honest, Merlin seeing the spies can be considered a "Special Move"
    // If we were to put that into here, in the startGame() function in the game.js file
    // Run all the role special moves once, and here, forcefully change the
    // see variable of the merlin's data object which will be sent to him.
  }

  getPublicGameData(): any {}
}

export default Merlin;
