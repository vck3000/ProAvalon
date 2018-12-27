function Percival(thisRoom_) {

    this.thisRoom = thisRoom_;

    this.role = "Percival";
    this.alliance = "Resistance";

    this.description = "Knows the identity of Merlin and Morgana.";
    this.orderPriorityInOptions = 80;

    this.test = function () {
        // The following lines running successfully shows that each role file can access
        // the variables and functions from the game room!
        console.log("HII from Percival. I will send messages to players through socket.emit()");
        var data = {
            message: "LOLOL FROM PERCY",
            classStr: "server-text"
        }

        this.thisRoom.io.in(this.thisRoom.roomId).emit("roomChatToClient", data);
    }

    // Percival sees Merlin and Morgana
    this.see = function () {
        var roleTag = {};

        for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
            if (this.thisRoom.playersInGame[i].role === "Merlin" || this.thisRoom.playersInGame[i].role === "Morgana") {
                roleTag[this.thisRoom.playersInGame[i].username] = {};
                roleTag[this.thisRoom.playersInGame[i].username].roleTag = "Merlin?";
            }
        }

        return roleTag;
    }
}


module.exports = Percival;