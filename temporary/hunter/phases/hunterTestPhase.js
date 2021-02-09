/* Each phase should have:
    - Name
    - Whether to show guns or not
    - GameMove to perform operations
    - Buttons that are visible and what text they have
    - Number of targets allowed to be selected
    - Status message to display
    - Prohibited Indexes to pick (an array)
*/

class HunterTestPhase {
    constructor(thisRoom) {
        this.thisRoom = thisRoom;

        this.phase = 'hunterTestPhase';
        this.showGuns = true;
    }


    gameMove(socket, buttonPressed, selectedPlayers) {
        /* TODO: GameMove */
    }

    // Returns a object with green and red keys.
    // Green and Red must both have the following properties:
    //  hidden          - Is the button hidden?
    //  disabled        - Is the button disabled?
    //  setText         - What text to display in the button
    buttonSettings(indexOfPlayer) {
        /* TODO: buttonSettings */
    }

    numOfTargets(indexOfPlayer) {
        /* TODO: numOfTargets */
    }


    getStatusMessage(indexOfPlayer) {
        /* TODO: getStatusMessage */
    }

    getProhibitedIndexesToPick(indexOfPlayer) {
        /* TODO: getProhibitedIndexesToPick in an array */
    }
}


module.exports = HunterTestPhase;
