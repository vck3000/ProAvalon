const Role = require("./role");

module.exports = class Oberon extends Role {
    constructor(thisRoom) {
        super(thisRoom, "Oberon", "Spy", "Oberon and Spies do not know each other.", 50);
    }

    // Oberon only sees him/herself
    see() {
        if (!this.thisRoom.gameStarted) return;

        const obj = { spies: [] };

        for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
            if (this.thisRoom.playersInGame[i].role === "Oberon") {
                obj.spies.push(this.thisRoom.playersInGame[i].username);
                break;
            }
        }

        return obj;
    }
};
