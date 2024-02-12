import { Phase } from '../phases';

class Finished {
  static phase = Phase.finished;
  phase = Phase.finished;

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.showGuns = true;
  }

  gameMove = function (socket, buttonPressed, selectedPlayers) {
    // Do nothing, game is finished.
  };

  // Returns a object with green and red keys.
  // Green and Red must both have the following properties:
  //  hidden          - Is the button hidden?
  //  disabled        - Is the button disabled?
  //  setText         - What text to display in the button
  buttonSettings = function (indexOfPlayer) {
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
  };

  numOfTargets = function (indexOfPlayer) {
    return null;
  };

  getStatusMessage = function (indexOfPlayer) {
    let winner = 'Error, undefined';
    if (this.thisRoom.winner === 'Resistance') {
      winner = 'resistance';
    } else if (this.thisRoom.winner === 'Spy') {
      winner = 'spies';
    }

    const str = `Game has finished. The ${winner} have won.`;
    return str;
  };
}

export default Finished;
