const Role = require("./role");

module.exports = class Mordred extends Role {
    constructor(thisRoom) {
        super(thisRoom, "Mordred", "Spy", "A spy who is invisible to Merlin.", 60);
    }

    // Morded sees all spies except oberon
    see() {
        if (!this.thisRoom.gameStarted) return;

        const obj = { spies: [] };

        for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
            if (this.thisRoom.playersInGame[i].alliance === "Spy") {
                if (this.thisRoom.playersInGame[i].role !== "Oberon") {
                    obj.spies.push(this.thisRoom.playersInGame[i].username);
                }
            }
        }

        return obj;
    }
};
