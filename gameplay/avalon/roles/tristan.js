function Tristan(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.role = "Tristan";
    this.alliance = "Resistance";

    this.description = "Tristan and Isolde both see each other.";
    this.orderPriorityInOptions = 50;

    this.see = function(){
        var obj = {};
        var array = [];

        for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
            if (this.thisRoom.playersInGame[i].role === "Isolde") {
                array.push(this.thisRoom.playersInGame[i].username);
            }
        } 
        obj.isolde = array;
        return obj;
    }
};


module.exports = Tristan;