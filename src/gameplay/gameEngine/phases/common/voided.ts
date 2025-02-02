import { ButtonSettings, IPhase, Phase } from '../types';
import { SocketUser } from '../../../../sockets/types';
import { Alliance } from '../../types';

class Voided implements IPhase {
  static phase = Phase.Voided;

  phase = Phase.Voided;
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
    // Game is voided, no actions.
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
    return 0;
  }

  getStatusMessage(indexOfPlayer: number): string {
    return 'The game has been voided. All actions are prevented.';
  }

  getProhibitedIndexesToPick(indexOfPlayer: number): number[] {
    return [];
  }
}

export default Voided;
