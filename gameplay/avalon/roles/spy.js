const Role = require("./role");

module.exports = class Spy extends Role {
    constructor(thisRoom) {
        super(thisRoom, "Spy", "Spy", "A standard Spy member.");
    }

    // Spy sees all spies except Oberon
    see() {
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
    }
};
