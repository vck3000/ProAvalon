class LadyOfTheLake {
    constructor(thisRoom) {
        this.thisRoom = thisRoom;

        this.specialPhase = 'lady';

        this.card = 'Lady of the Lake';

        this.indexOfPlayerHolding;
        this.lastMissionUsed = 0;

        this.ladyHistory = []; // To be stored in the database later.
        this.ladyHistoryUsernames = [];

        this.ladyChain = []; // To be stored in the database later.

        this.description = 'Reveals the alliance of the person being carded to the card holder. The card is used after each Mission after Mission 2.';
    }

    initialise() {
        this.setHolder((this.thisRoom.teamLeader + 1) % this.thisRoom.playersInGame.length);
    }

    setHolder(index) {
        this.indexOfPlayerHolding = index;
        this.ladyHistory.push(index);
        this.ladyHistoryUsernames.push(this.thisRoom.playersInGame[index].username);
        this.ladyChain.push(this.thisRoom.playersInGame[index].role);
    }

    checkSpecialMove(socket, buttonPressed, selectedPlayers) {
        // Only use lady of the lake after m2, when the success/fail is revealed, but before the next mission starts.
        // Only once per mission.

        // First card starts at the end of M2

        // Game finished? Don't run lady if there are 3 successes or fails
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
            && this.thisRoom.howWasWon !== 'Hammer rejected.'
            && this.lastMissionUsed !== this.thisRoom.missionNum
            && numSuccess < 3
            && numFail < 3
        ) {
            this.thisRoom.phase = 'lady';
            this.lastMissionUsed = this.thisRoom.missionNum;

            return true;
        }

        return false;
    }

    getPublicGameData() {
        /* TODO: (Can delete this function. Not absolutely necessary)
        Public data to show the user(s) e.g. who holds the lady of the lake */
        return {
            lady: {
                index: this.indexOfPlayerHolding,
                history: this.ladyHistoryUsernames,
                name: this.card,
            },
        };
    }
}

module.exports = LadyOfTheLake;
