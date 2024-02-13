import { Phase } from '../phases';

class Paused {
  static phase = Phase.paused;

  phase = Phase.paused;
  showGuns = true;

  constructor(thisRoom_) {
    this.thisRoom = thisRoom_;
  }

  gameMove(socket, buttonPressed, selectedPlayers) {
    // Game is paused, no actions.
  }

  buttonSettings(indexOfPlayer) {
    const obj = {
      green: {},
      red: {},
    };

    obj.green.hidden = true;
    obj.green.disabled = true;
    obj.green.setText = '';

    obj.red.hidden = true;
    obj.red.disabled = true;
    obj.red.setText = '';

    return obj;
  }

  numOfTargets(indexOfPlayer) {
    return null;
  }

  getStatusMessage(indexOfPlayer) {
    return 'A moderator has paused the game. All actions are prevented.';
  }
}

export default Paused;
