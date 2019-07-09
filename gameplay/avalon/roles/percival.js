const Role = require("./role");

module.exports = class Percival extends Role {
    constructor(thisRoom) {
        super(thisRoom, "Percival", "Resistance", "Knows the identity of Merlin and Morgana.", 80);
    }

    test() {
    // The following lines running successfully shows that each role file can access
    // the variables and functions from the game room!
        console.log("HII from Percival. I will send messages to players through socket.emit()");
        const data = {
            message: "LOLOL FROM PERCY",
            classStr: "server-text",
        };

        this.thisRoom.io.in(this.thisRoom.roomId).emit("roomChatToClient", data);
    }

    // Percival sees Merlin and Morgana
    see() {
        const roleTag = {};

        for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
            if (this.thisRoom.playersInGame[i].role === "Merlin" || this.thisRoom.playersInGame[i].role === "Morgana") {
                roleTag[this.thisRoom.playersInGame[i].username] = {};
                roleTag[this.thisRoom.playersInGame[i].username].roleTag = "Merlin?";
            }
        }

        return roleTag;
    }
};
