const Role = require("./role");

module.exports = class Morgana extends Role {
    constructor(thisRoom) {
        super(thisRoom, "Morgana", "Spy", "A spy who looks like Merlin to Percival.", 70);
    }

    // Morgana sees all spies except oberon
    see() {
        if (this.thisRoom.gameStarted) {
            const obj = { spies: [] };

            for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
                if (this.thisRoom.playersInGame[i].alliance === "Spy") {
                    if (this.thisRoom.playersInGame[i].role === "Oberon") {
                        // don't add oberon
                    } else {
                        // add the spy
                        obj.spies.push(this.thisRoom.playersInGame[i].username);
                    }
                }
            }

            return obj;
        }
    }
};
