import { Phase } from '../../phases/types';
import { Card, ICard } from '../types';
import { SocketUser } from '../../../sockets/types';

class SireOfTheSea implements ICard {
  private thisRoom: any;

  static card = Card.SireOfTheSea;
  card = Card.SireOfTheSea;

  lastMissionUsed = 0;
  indexOfPlayerHolding = 0;

  sireHistory: number[] = []; // Indexes of players
  sireHistoryUsernames: string[] = [];

  // TODO replace with role[]
  sireChain: string[] = []; // To be stored in the database later.

  description =
    "Reveals the card holder's alliance to the person being carded.";

  constructor(thisRoom: any) {
    this.thisRoom = thisRoom;
  }

  initialise(): void {
    // If lady of the sea is in the game, give the card to the next person.
    let addOne = 0;
    if (this.thisRoom.options.includes('Lady of the Lake')) {
      addOne = 1;
    }
    this.setHolder(
      (this.thisRoom.teamLeader + 1 + addOne) %
        this.thisRoom.playersInGame.length,
    );
  }

  setHolder(index: number): void {
    this.indexOfPlayerHolding = index;
    this.sireHistory.push(index);
    this.sireHistoryUsernames.push(this.thisRoom.playersInGame[index].username);
    this.sireChain.push(this.thisRoom.playersInGame[index].role);
  }

  checkSpecialMove(
    socket: SocketUser,
    buttonPressed: 'yes' | 'no',
    selectedPlayers: string[],
  ): boolean {
    // Only use sire of the sea after m2, when the success/fail is revealed, but before the next mission starts.
    // Only once per mission.

    // First card starts at the end of M2

    // Game finished? Don't run sire if there are 3 successes or fails
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
      this.thisRoom.changePhase(Phase.Sire);
      this.lastMissionUsed = this.thisRoom.missionNum;

      return true;
    }

    return false;
  }

  getPublicGameData(): any {
    /* TODO: (Can delete this function. Not absolutely necessary)
        Public data to show the user(s) e.g. who holds the sire of the sea */
    return {
      sire: {
        index: this.indexOfPlayerHolding,
        history: this.thisRoom.anonymizer.anonMany(this.sireHistoryUsernames),
        name: this.card,
      },
    };
  }
}

export default SireOfTheSea;
