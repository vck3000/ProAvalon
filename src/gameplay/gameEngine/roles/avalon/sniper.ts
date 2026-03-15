import { Alliance } from '../../types';
import { Role } from '../types';
import Game from '../../game';
import { Phase } from '../../phases/types';
import Resistance from './resistance';
import Sniping from '../../phases/avalon/sniping';

class Sniper extends Resistance {
  room: Game;

  static role = Role.Sniper;
  role = Role.Sniper;

  alliance = Alliance.Resistance;
  specialPhase = Phase.Sniping;

  startSnipingTime: Date;

  description =
    'If the resistance win 3 missions, the Sniper can shoot one person for Assassin. If they are correct, the resistance win!';
  orderPriorityInOptions = 91;

  playerShot = '';
  shotCorrectly = false;

  // Sniping phase
  checkSpecialMove() {
    // Check for sniping mode and enter it if it is the right time
    if (this.playerShot === '') {
      // If we have the right conditions, we go into sniping phase
      if (this.room.phase === Phase.Finished) {
        // Get the number of successes:
        let numOfSuccesses = 0;

        for (let i = 0; i < this.room.missionHistory.length; i++) {
          if (this.room.missionHistory[i] === 'succeeded') {
            numOfSuccesses++;
          }
        }

        if (numOfSuccesses === 3) {
          // Set the sniping phase
          this.startSnipingTime = new Date();
          // Override the role. Our this.role can be overridden by child inheritors.
          this.room.specialPhases[Sniping.phase].role = this.role;
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
        sniperShotUsername: this.room.anonymizer.anon(this.playerShot),
      };
    }

    return null;
  }
}

export default Sniper;
