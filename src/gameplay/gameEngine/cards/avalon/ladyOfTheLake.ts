import { Phase } from '../../phases/types';
import { Card, ICard } from '../types';
import { SocketUser } from '../../../../sockets/types';

class LadyOfTheLake implements ICard {
  private thisRoom: any;

  static card = Card.LadyOfTheLake;
  card = Card.LadyOfTheLake;

  lastMissionUsed = 0;
  indexOfPlayerHolding = 0;
  ladyHistory: number[] = []; // Indexes of players
  ladyHistoryUsernames: string[] = [];

  // List of roles that were carded
  // Should be named differently but database already has it named this.
  ladyChain: string[] = [];

  description =
    'Reveals the alliance of the person being carded to the card holder. The card is used after each Mission after Mission 2.';

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
    this.ladyHistory.push(index);
    this.ladyHistoryUsernames.push(this.thisRoom.playersInGame[index].username);
    this.ladyChain.push(this.thisRoom.playersInGame[index].role);
  }

  checkSpecialMove(
    socket: SocketUser,
    buttonPressed: 'yes' | 'no',
    selectedPlayers: string[],
  ): boolean {
    // Only use lady of the lake after m2, when the success/fail is revealed, but before the next mission starts.
    // Only once per mission.

    // First card starts at the end of M2

    // Game finished? Don't run lady if there are 3 successes or fails
    let numSuccess = 0;
    let numFail = 0;
    for (let i = 0; i < this.thisRoom.missionHistory.length; i++) {
      if (this.thisRoom.missionHistory[i] === 'succeeded') {
        numSuccess += 1;
      } else if (this.thisRoom.missionHistory[i] === 'failed') {
        numFail += 1;
      }
    }

    if (
      this.thisRoom.missionHistory.length >= 2 &&
      this.thisRoom.howWasWon !== 'Hammer rejected.' &&
      this.lastMissionUsed !== this.thisRoom.missionNum &&
      numSuccess < 3 &&
      numFail < 3
    ) {
      this.thisRoom.changePhase(Phase.Lady);
      this.lastMissionUsed = this.thisRoom.missionNum;

      return true;
    }

    return false;
  }

  getPublicGameData(): any {
    /* TODO: (Can delete this function. Not absolutely necessary)
        Public data to show the user(s) e.g. who holds the lady of the lake */
    return {
      lady: {
        index: this.indexOfPlayerHolding,
        history: this.thisRoom.anonymizer.anonMany(this.ladyHistoryUsernames),
        name: this.card,
      },
    };
  }
}

export default LadyOfTheLake;
