import { ButtonSettings, IPhase, Phase } from '../types';
import { SocketUser } from '../../../sockets/types';

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
}

export default Voided;
