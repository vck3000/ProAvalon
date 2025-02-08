import { ButtonSettings, IPhase, Phase } from '../types';
import { SocketUser } from '../../../../sockets/types';

class Paused implements IPhase {
  static phase = Phase.Paused;

  phase = Phase.Paused;
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

  numOfTargets(indexOfPlayer: number): number | number[] {
    return null;
  }

  getStatusMessage(indexOfPlayer: number): string {
    return 'A moderator has paused the game. All actions are prevented.';
  }

  getProhibitedIndexesToPick(indexOfPlayer: number): number[] {
    return [];
  }
}

export default Paused;
