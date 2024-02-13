import { ButtonSettings, IPhase, Phase } from '../phases';
import { SocketUser } from '../../sockets/types';
import { Alliance } from '../types';

class Finished implements IPhase {
  static phase = Phase.finished;
  phase = Phase.finished;
  showGuns = true;
  private thisRoom: any;

  constructor(thisRoom: any) {
    this.thisRoom = thisRoom;
  }

  gameMove(
    socket: SocketUser,
    buttonPressed: string,
    selectedPlayers: string[],
  ): void {
    // Do nothing, game is finished.
  }

  // Returns a object with green and red keys.
  // Green and Red must both have the following properties:
  //  hidden          - Is the button hidden?
  //  disabled        - Is the button disabled?
  //  setText         - What text to display in the button
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
    let winner = 'Error, undefined';
    if (this.thisRoom.winner === Alliance.Resistance) {
      winner = 'resistance';
    } else if (this.thisRoom.winner === Alliance.Spy) {
      winner = 'spies';
    }

    const str = `Game has finished. The ${winner} have won.`;
    return str;
  }

  getProhibitedIndexesToPick(indexOfPlayer: number): number[] {
    return [];
  }
}

export default Finished;
