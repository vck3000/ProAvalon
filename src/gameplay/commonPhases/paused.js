/* Each phase must have:
- Name
- Whether to show guns or not
- GameMove to perform operations
- Buttons that are visible and what text they have
- Number of targets allowed to be selected
- Status message to display
*/
const usernamesIndexes = require('../../myFunctions/usernamesIndexes');

function Paused(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.phase = 'paused';
    this.showGuns = true;
}

Paused.prototype.gameMove = function (socket, buttonPressed, selectedPlayers) {
    // Game is paused, no actions.
};

Paused.prototype.buttonSettings = function (indexOfPlayer) {
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

Paused.prototype.numOfTargets = function (indexOfPlayer) {
    return null;
};

Paused.prototype.getStatusMessage = function (indexOfPlayer) {
    return 'A moderator has paused the game. All actions are prevented.';
};

module.exports = Paused;