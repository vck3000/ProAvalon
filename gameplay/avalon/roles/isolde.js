function Isolde(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.role = "Isolde";
    this.alliance = "Resistance";

    this.description = "Tristan and Isolde both see each other.";
    this.orderPriorityInOptions = 50;

    this.see = function(){
        var obj = {};
        var array = [];

        for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
            if (this.thisRoom.playersInGame[i].role === "Tristan") {
                array.push(this.thisRoom.playersInGame[i].username);
            }
        } 
        obj.tristan = array;
        return obj;
    }
};


module.exports = Isolde;