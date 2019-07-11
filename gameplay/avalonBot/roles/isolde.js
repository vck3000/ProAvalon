function Isolde(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.role = "Isolde";
    this.alliance = "Resistance";

    this.description = "Tristan and Isolde both see each other.";
    this.orderPriorityInOptions = 50;

    this.see = function () {
        const roleTag = {};

        for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
            if (this.thisRoom.playersInGame[i].role === "Tristan") {
                roleTag[this.thisRoom.playersInGame[i].username] = {};
                roleTag[this.thisRoom.playersInGame[i].username].roleTag = "Tristan";
            }
        }

        return roleTag;
    };
}


module.exports = Isolde;
