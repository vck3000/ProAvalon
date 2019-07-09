class Phase {
    /**
    *
    * @param {*} thisRoom
    * @param {String} phase the name of the phase
    * @param {boolean} showGuns whether or not to show guns
    */
    constructor(thisRoom, phase, showGuns) {
        this.thisRoom = thisRoom;

        this.phase = phase;
        this.showGuns = showGuns;
    }

    /** GameMove to perform operations */
    gameMove(socket, data) {
    }

    /**
     * Buttons that are visible and what text they have.
     * Returns a object with green and red keys.
     * Green and Red must both have the following properties:
     *      hidden          - Is the button hidden?
     *      disabled        - Is the button disabled?
     *      setText         - What text to display in the button
     */
    buttonSettings(indexOfPlayer) {
    }


    /** Number of targets allowed to be selected */
    numOfTargets(indexOfPlayer) {
        return null;
    }

    /** Status message to display */
    getStatusMessage(indexOfPlayer) {
    }

    /** Prohibited indices to pick (an array) */
    getProhibitedIndexesToPick(indexOfPlayer) {
    }
}

module.exports = Phase;
