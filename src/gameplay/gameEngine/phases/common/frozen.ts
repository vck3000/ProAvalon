import { ButtonSettings, IPhase, Phase } from '../types';
import { SocketUser } from '../../../../sockets/types';

class Frozen implements IPhase {
  static phase = Phase.Frozen;
  phase = Phase.Frozen;
  showGuns = true;
  private thisRoom: any;

  constructor(thisRoom_: any) {
    this.thisRoom = thisRoom_;
  }

  gameMove(
    socket: SocketUser,
    buttonPressed: string,
    selectedPlayers: string[],
  ): void {
    // Game is paused, no actions.
  }

  buttonSettings(indexOfPlayer: number): ButtonSettings {
    return {
      green: {
        hidden: true,
        disabled: true,
        setText: '',
      },
      red: {
        hidden: true,
        disabled: true,
        setText: '',
      },
    };
  }

  numOfTargets(indexOfPlayer: number): number {
    return 0;
  }

  getStatusMessage(indexOfPlayer: number): string {
    return 'The game is frozen. Waiting for all players to rejoin.';
  }

  getProhibitedIndexesToPick(indexOfPlayer: number): number[] {
    return [];
  }
}

export default Frozen;
