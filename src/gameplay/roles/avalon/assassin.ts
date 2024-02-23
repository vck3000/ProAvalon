import { Alliance, See } from '../../types';
import Game from '../../game';
import { Phase } from '../../phases/types';
import { IRole, Role } from '../types';

class Assassin implements IRole {
  room: Game;

  // TODO pretty ugly...
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
    if (this.room.gameStarted === true) {
      const array = [];

      for (let i = 0; i < this.room.playersInGame.length; i++) {
        if (this.room.playersInGame[i].alliance === Alliance.Spy) {
          if (this.room.playersInGame[i].role === Role.Oberon) {
            // don't add oberon
          } else {
            // add the spy
            array.push(this.room.playersInGame[i].username);
          }
        }
      }

      return { spies: array };
    }
  }

  // Assassination phase
  checkSpecialMove() {
    // Check for assassination mode and enter it if it is the right time
    if (this.playerShot === '') {
      // If we have the right conditions, we go into assassination phase
      if (this.room.phase === 'Finished') {
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
        assassinShotUsername: this.playerShot,
        assassinShotUsername2: this.playerShot2,
      };
    }

    return null;
  }
}

export default Assassin;
