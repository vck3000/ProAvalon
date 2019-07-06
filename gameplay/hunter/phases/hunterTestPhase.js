/* Each phase should have:
    - Name
    - Whether to show guns or not
    - GameMove to perform operations
    - Buttons that are visible and what text they have
    - Number of targets allowed to be selected
    - Status message to display
    - Prohibited Indexes to pick (an array)
*/

function HunterTestPhase(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.phase = "hunterTestPhase";
    this.showGuns = true;
}

HunterTestPhase.prototype.gameMove = function (socket, data) {
    /* TODO: GameMove*/
};

// Returns a object with green and red keys. 
// Green and Red must both have the following properties:
//  hidden          - Is the button hidden?
//  disabled        - Is the button disabled?
//  setText         - What text to display in the button
HunterTestPhase.prototype.buttonSettings = function (indexOfPlayer) {
    /* TODO: buttonSettings*/
};

HunterTestPhase.prototype.numOfTargets = function (indexOfPlayer) {
    /* TODO: numOfTargets*/
};


HunterTestPhase.prototype.getStatusMessage = function (indexOfPlayer) {
    /* TODO: getStatusMessage*/
};

HunterTestPhase.prototype.getProhibitedIndexesToPick = function (indexOfPlayer) {
    /* TODO: getProhibitedIndexesToPick in an array*/
};





module.exports = HunterTestPhase;

