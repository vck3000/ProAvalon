function Rogue(thisRoom_) {

    this.thisRoom = thisRoom_;

    this.role = "Rogue";
    this.alliance = "Spy";

    this.description = "A spy who cannot fail missions.";
    this.orderPriorityInOptions = 65;

    //Rogue sees all spies
    this.see = function () {
        if (this.thisRoom.gameStarted === true) {
            var obj = {};
            var array = [];

            for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
                if (this.thisRoom.playersInGame[i].alliance === "Spy") {

                    if (this.thisRoom.playersInGame[i].role === "Oberon") {
                        //don't add oberon
                    }
                    else {
                     //add the spy
                        array.push(this.thisRoom.playersInGame[i].username);
                    }
                }
            }

            obj.spies = array;
            return obj;
        }
    }

    this.checkSpecialMove = function () {

    }

}


module.exports = Rogue;
