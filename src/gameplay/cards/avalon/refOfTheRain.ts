import { Phase } from '../../phases/types';
import { Card, ICard } from '../types';
import { SocketUser } from '../../../sockets/types';

class RefOfTheRain implements ICard {
  private thisRoom: any;

  static card = Card.RefOfTheRain;
  card = Card.RefOfTheRain;

  lastMissionUsed = 0;
  indexOfPlayerHolding = 0;

  refHistory: number[] = []; // Indexes of players
  refHistoryUsernames: string[] = [];

  // TODO change to role[]
  refChain: string[] = []; // To be stored in the database later.

  description =
    'Reveals the alliance of the person being carded to the card holder. The card is used after the previous mission fails.';

  constructor(thisRoom: any) {
    this.thisRoom = thisRoom;
  }

  initialise(): void {
    this.setHolder(
      (this.thisRoom.teamLeader + 1) % this.thisRoom.playersInGame.length,
    );
  }

  setHolder(index: number): void {
    this.indexOfPlayerHolding = index;
    this.refHistory.push(index);
    this.refHistoryUsernames.push(this.thisRoom.playersInGame[index].username);
    this.refChain.push(this.thisRoom.playersInGame[index].role);
  }

  checkSpecialMove(
    socket: SocketUser,
    buttonPressed: 'yes' | 'no',
    selectedPlayers: string[],
  ): boolean {
    // Only use ref of the rain after m2, when the success/fail is revealed, but before the next mission starts.
    // Only once per mission.

    // First card starts at the end of M2

    // Game finished? Don't run ref if there are 3 successes or fails
    let numSuccess = 0;
    let numFail = 0;
    for (let i = 0; i < this.thisRoom.missionHistory.length; i++) {
      if (this.thisRoom.missionHistory[i] === 'succeeded') {
        numSuccess += 1;
      } else if (this.thisRoom.missionHistory[i] === 'failed') {
        numFail += 1;
      }
    }

    // Run card after the previous mission failed.
    let lastMissionFailed = false;
    if (
      this.thisRoom.missionHistory[this.thisRoom.missionHistory.length - 1] ===
      'failed'
    ) {
      lastMissionFailed = true;
    }

    if (
      lastMissionFailed === true &&
      this.thisRoom.howWasWon !== 'Hammer rejected.' &&
      this.lastMissionUsed !== this.thisRoom.missionNum &&
      numSuccess < 3 &&
      numFail < 3
    ) {
      this.thisRoom.changePhase(Phase.Ref);
      this.lastMissionUsed = this.thisRoom.missionNum;

      return true;
    }

    return false;
  }

  getPublicGameData(): any {
    /* TODO: (Can delete this function. Not absolutely necessary)
        Public data to show the user(s) e.g. who holds the ref of the rain */
    return {
      ref: {
        index: this.indexOfPlayerHolding,
        history: this.thisRoom.anonymizer.anonMany(this.refHistoryUsernames),
        name: this.card,
      },
    };
  }
}

export default RefOfTheRain;
