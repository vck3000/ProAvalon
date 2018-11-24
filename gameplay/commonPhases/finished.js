/* Each phase must have:
    - Name
    - GameMove to perform operations
    - Buttons that are visible and what text they have
    - Number of targets allowed to be selected
    - Whether to show guns or not
    - Status message to display
*/
var usernamesIndexes = require("../../myFunctions/usernamesIndexes");

function Finished(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.phase = "finished";
};

Finished.prototype.gameMove = function(socket, data){        
    // Do nothing, game is finished.
};

module.exports = Finished;

