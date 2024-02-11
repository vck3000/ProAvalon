import { Role, See } from '../../types';
import Game from '../../game';
import Phase from '../phases/phases';

class Assassin implements Role {
  // @ts-ignore
  room: Game;
  // TODO pretty ugly...
  static role = 'Assassin';
  role = Assassin.role;

  alliance = 'Spy';
  specialPhase = Phase.assassination;

  description =
    'If the resistance win 3 missions, the Assassin can shoot one person for Merlin, or two people for Tristan and Isolde. If they are correct, the spies win!';
  orderPriorityInOptions = 90;

  playerShot = '';
  playerShot2 = '';

  // @ts-ignore
  constructor(room: Game) {
    this.room = room;
  }

  // Assassin sees all spies except oberon
  see(): See {
    if (this.room.gameStarted === true) {
      const array = [];

      for (let i = 0; i < this.room.playersInGame.length; i++) {
        if (this.room.playersInGame[i].alliance === 'Spy') {
          if (this.room.playersInGame[i].role === 'Oberon') {
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
      if (this.room.phase === 'finished') {
        // Get the number of successes:
        let numOfSuccesses = 0;

        for (var i = 0; i < this.room.missionHistory.length; i++) {
          if (this.room.missionHistory[i] === 'succeeded') {
            numOfSuccesses++;
          }
        }

        // Check if Merlin exists.
        let merlinExists = false;
        // Check if iso tristan are both in the game.
        let tristExists = false;
        let isoExists = false;

        for (var i = 0; i < this.room.playersInGame.length; i++) {
          if (this.room.playersInGame[i].role === 'Merlin') {
            merlinExists = true;
          }
          if (this.room.playersInGame[i].role === 'Tristan') {
            tristExists = true;
          }

          if (this.room.playersInGame[i].role === 'Isolde') {
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
          this.room.phase = this.specialPhase;
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
