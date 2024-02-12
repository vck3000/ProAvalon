/* Each phase must have:
- Name
- Whether to show guns or not
- GameMove to perform operations
- Buttons that are visible and what text they have
- Number of targets allowed to be selected
- Status message to display
*/
import { Phase } from '../phases';

function Frozen(thisRoom_) {
  this.thisRoom = thisRoom_;

  this.phase = Phase.frozen;
  this.showGuns = true;
}

Frozen.prototype.gameMove = function (socket, buttonPressed, selectedPlayers) {
  // Game is paused, no actions.
};

Frozen.prototype.buttonSettings = function (indexOfPlayer) {
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

Frozen.prototype.numOfTargets = function (indexOfPlayer) {
  return null;
};

Frozen.prototype.getStatusMessage = function (indexOfPlayer) {
  return 'The game is frozen. Waiting for all players to rejoin.';
};

export default Frozen;
