import { Alliance, See } from '../../types';
import Game from '../../game';
import { Phase } from '../../phases/types';
import { IRole, Role } from '../types';
import Assassination from '../../phases/avalon/assassination';

class Assassin implements IRole {
  room: Game;

  static role = Role.Assassin;
  role = Role.Assassin;

  alliance = Alliance.Spy;
  specialPhase = Phase.Assassination;

  description =
    'If the resistance win 3 missions, the Assassin can shoot one person for Merlin, or two people for Tristan and Isolde. If they are correct, the spies win!';
  orderPriorityInOptions = 90;

  playerShot = '';
  playerShot2 = '';

  constructor(room: Game) {
    this.room = room;
  }

  // Assassin sees all spies except oberon
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
      return { spies: spies, roleTags: {} };
    }
  }

  // Assassination phase
  checkSpecialMove() {
    // Check for assassination mode and enter it if it is the right time
    if (this.playerShot === '') {
      // If we have the right conditions, we go into assassination phase
      if (this.room.phase === Phase.Finished) {
        // Get the number of successes:
        let numOfSuccesses = 0;

        for (let i = 0; i < this.room.missionHistory.length; i++) {
          if (this.room.missionHistory[i] === 'succeeded') {
            numOfSuccesses++;
          }
        }

        // Check if Merlin exists.
        let merlinExists = false;
        // Check if iso tristan are both in the game.
        let tristExists = false;
        let isoExists = false;

        for (let i = 0; i < this.room.playersInGame.length; i++) {
          if (this.room.playersInGame[i].role === Role.Merlin) {
            merlinExists = true;
          }
          if (this.room.playersInGame[i].role === Role.Tristan) {
            tristExists = true;
          }

          if (this.room.playersInGame[i].role === Role.Isolde) {
            isoExists = true;
          }
        }

        if (
          numOfSuccesses === 3 &&
          (merlinExists === true ||
            (tristExists === true && isoExists === true))
        ) {
          // Set the assassination phase
          this.room.startAssassinationTime = new Date();
          // Override the role. Our this.role can be overridden by child inheritors.
          this.room.specialPhases[Assassination.phase].role = this.role;
          this.room.changePhase(this.specialPhase);
          return true;
        }
      }
    }

    return false;
  }

  getPublicGameData() {
    if (this.playerShot !== '') {
      return {
        assassinShotUsername: this.room.anonymizer.anon(this.playerShot),
        assassinShotUsername2: this.playerShot2
          ? this.room.anonymizer.anon(this.playerShot2)
          : '',
      };
    }

    return null;
  }
}

export default Assassin;
