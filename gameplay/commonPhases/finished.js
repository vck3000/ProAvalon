const Phase = require("./phase");

class Finished extends Phase {
    constructor(thisRoom) {
        super(thisRoom, "finished", true);
    }

    buttonSettings(indexOfPlayer) {
        const obj = {
            green: {
                hidden: true,
                disabled: true,
                setText: "",
            },
            red: {
                hidden: true,
                disabled: true,
                setText: "",
            },
        };

        return obj;
    }

    numOfTargets(indexOfPlayer) {
        return null;
    }

    getStatusMessage(indexOfPlayer) {
        let winner = "Error, undefined";
        if (this.thisRoom.winner === "Resistance") {
            winner = "resistance";
        } else if (this.thisRoom.winner === "Spy") {
            winner = "spies";
        }

        const str = `Game has finished. The ${winner} have won.`;
        return str;
    }
}

module.exports = Finished;
