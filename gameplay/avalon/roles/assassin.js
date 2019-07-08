const usernamesIndexes = require("../../../myFunctions/usernamesIndexes");

function Assassin(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.specialPhase = "assassination";

    this.role = "Assassin";
    this.alliance = "Spy";

    this.description = "If the resistance win 3 missions, the Assassin can shoot one person for Merlin, or two people for Tristan and Isolde. If they are correct, the spies win!";
    this.orderPriorityInOptions = 90;

    this.playerShot = "";
    this.playerShot2 = "";

    // Assassin sees all spies except oberon
    this.see = function () {
        if (this.thisRoom.gameStarted) {
            const obj = {};
            const array = [];

            for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
                if (this.thisRoom.playersInGame[i].alliance === "Spy") {
                    if (this.thisRoom.playersInGame[i].role === "Oberon") {
                        // don't add oberon
                    } else {
                        // add the spy
                        array.push(this.thisRoom.playersInGame[i].username);
                    }
                }
            }

            obj.spies = array;
            return obj;
        }
    };
}

// Assassination phase
Assassin.prototype.checkSpecialMove = function (socket, data) {
    // Check for assassination mode and enter it if it is the right time
    if (this.playerShot === "") {
    // If we have the right conditions, we go into assassination phase
        if (this.thisRoom.phase === "finished") {
            // Get the number of successes:
            let numOfSuccesses = 0;

            for (let i = 0; i < this.thisRoom.missionHistory.length; i++) {
                if (this.thisRoom.missionHistory[i] === "succeeded") {
                    numOfSuccesses++;
                }
            }

            // Check if Merlin exists.
            let merlinExists = false;
            // Check if iso tristan are both in the game.
            let tristExists = false;
            let isoExists = false;

            for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
                if (this.thisRoom.playersInGame[i].role === "Merlin") {
                    merlinExists = true;
                }
                if (this.thisRoom.playersInGame[i].role === "Tristan") {
                    tristExists = true;
                }

                if (this.thisRoom.playersInGame[i].role === "Isolde") {
                    isoExists = true;
                }
            }

            if (numOfSuccesses === 3 && ((merlinExists) || (tristExists && isoExists))) {
                // Set the assassination phase
                this.thisRoom.startAssassinationTime = new Date();
                this.thisRoom.phase = this.specialPhase;
                return true;
            }
        }
    }

    return false;
};

Assassin.prototype.getPublicGameData = function () {
    if (this.playerShot !== "") {
        return {
            assassinShotUsername: this.playerShot,
            assassinShotUsername2: this.playerShot2,
        };
    }

    return null;
};


module.exports = Assassin;
