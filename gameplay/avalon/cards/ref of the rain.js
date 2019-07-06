
function RefOfTheLake(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.specialPhase = "ref";

    this.card = "Ref of the Rain";

    this.indexOfPlayerHolding;
    this.lastMissionUsed = 0;

    this.refHistory = []; // To be stored in the database later.
    this.refHistoryUsernames = [];

    this.refChain = []; // To be stored in the database later.

    this.description = "Reveals the alliance of the person being carded to the card holder. The card is used after the previous mission fails.";
}

RefOfTheLake.prototype.initialise = function () {
    this.setHolder((this.thisRoom.teamLeader + 1) % this.thisRoom.playersInGame.length);
};

RefOfTheLake.prototype.setHolder = function (index) {
    this.indexOfPlayerHolding = index;
    this.refHistory.push(index);
    this.refHistoryUsernames.push(this.thisRoom.playersInGame[index].username);
    this.refChain.push(this.thisRoom.playersInGame[index].role);
};

RefOfTheLake.prototype.checkSpecialMove = function (socket, data) {
    // Only use ref of the rain after m2, when the success/fail is revealed, but before the next mission starts.
    // Only once per mission.

    // First card starts at the end of M2

    // Game finished? Don't run ref if there are 3 successes or fails
    var numSuccess = 0;
    var numFail = 0;
    for (var i = 0; i < this.thisRoom.missionHistory.length; i++) {
        if (this.thisRoom.missionHistory[i] === "succeeded") {
            numSuccess += 1;
        }
        else if (this.thisRoom.missionHistory[i] === "failed") {
            numFail += 1;
        }
    }

    // Run card after the previous mission failed.
    var lastMissionFailed = false;
    if (this.thisRoom.missionHistory[this.thisRoom.missionHistory.length - 1] === "failed") {
        lastMissionFailed = true;
    }

    if (lastMissionFailed === true &&
		this.thisRoom.howWasWon !== "Hammer rejected." &&
		this.lastMissionUsed !== this.thisRoom.missionNum &&
		numSuccess < 3 &&
		numFail < 3
    ) {
        this.thisRoom.phase = "ref";
        this.lastMissionUsed = this.thisRoom.missionNum;

        return true;
    }
    else {
        return false;
    }
};

RefOfTheLake.prototype.getPublicGameData = function () {
    /* TODO: (Can delete this function. Not absolutely necessary)
	Public data to show the user(s) e.g. who holds the ref of the rain */
    return {
        ref: {
            index: this.indexOfPlayerHolding,
            history: this.refHistoryUsernames,
            name: this.card
        }
    };
};


module.exports = RefOfTheLake;