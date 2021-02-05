class SireOfTheSea {
    constructor(thisRoom) {
        this.thisRoom = thisRoom;

        this.specialPhase = 'sire';

        this.card = 'Sire of the Sea';

        this.indexOfPlayerHolding;
        this.lastMissionUsed = 0;

        this.sireHistory = []; // To be stored in the database later.
        this.sireHistoryUsernames = [];

        this.sireChain = []; // To be stored in the database later.

        this.description = "Reveals the card holder's alliance to the person being carded.";
    }

    initialise() {
        // If lady of the sea is in the game, give the card to the next person.
        let addOne = 0;
        if (this.thisRoom.options.includes('Lady of the Lake')) {
            addOne = 1;
        }
        this.setHolder((this.thisRoom.teamLeader + 1 + addOne) % this.thisRoom.playersInGame.length);
    }

    setHolder(index) {
        this.indexOfPlayerHolding = index;
        this.sireHistory.push(index);
        this.sireHistoryUsernames.push(this.thisRoom.playersInGame[index].username);
        this.sireChain.push(this.thisRoom.playersInGame[index].role);
    }

    checkSpecialMove(socket, buttonPressed, selectedPlayers) {
        // Only use sire of the sea after m2, when the success/fail is revealed, but before the next mission starts.
        // Only once per mission.

        // First card starts at the end of M2

        // Game finished? Don't run sire if there are 3 successes or fails
        let numSuccess = 0;
        let numFail = 0;
        for (let i = 0; i < this.thisRoom.missionHistory.length; i++) {
            if (this.thisRoom.missionHistory[i] === 'succeeded') {
                numSuccess += 1;
            } else if (this.thisRoom.missionHistory[i] === 'failed') {
                numFail += 1;
            }
        }

        if (this.thisRoom.missionHistory.length >= 2
            && this.lastMissionUsed !== this.thisRoom.missionNum
            && numSuccess < 3
            && numFail < 3
        ) {
            this.thisRoom.phase = 'sire';
            this.lastMissionUsed = this.thisRoom.missionNum;

            return true;
        }

        return false;
    }

    getPublicGameData() {
        /* TODO: (Can delete this function. Not absolutely necessary)
        Public data to show the user(s) e.g. who holds the sire of the sea */
        return {
            sire: {
                index: this.indexOfPlayerHolding,
                history: this.sireHistoryUsernames,
                name: this.card,
            },
        };
    }
}

module.exports = SireOfTheSea;
