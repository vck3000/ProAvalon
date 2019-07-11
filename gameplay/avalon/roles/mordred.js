

function Mordred(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.role = "Mordred";
    this.alliance = "Spy";

    this.description = "A spy who is invisible to Merlin.";
    this.orderPriorityInOptions = 60;

    // Morded sees all spies except oberon
    this.see = function () {
        if (this.thisRoom.gameStarted === true) {
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

    this.checkSpecialMove = function () {

    };
}


module.exports = Mordred;
