function Oberon(thisRoom_) {

    this.thisRoom = thisRoom_;

    this.role = "Oberon";
    this.alliance = "Spy";

    this.description = "Oberon and Spies do not know each other."
    this.orderPriorityInOptions = 50;

    //Oberon only sees him/herself
    this.see = function () {
        if (this.thisRoom.gameStarted === true) {
            var obj = {};
            var array = [];

            for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
                if (this.thisRoom.playersInGame[i].role === "Oberon") {
                    array.push(this.thisRoom.playersInGame[i].username);
                    break;
                }
            }

            obj.spies = array;
            return obj;
        }
    }

    this.checkSpecialMove = function () {

    }

}


module.exports = Oberon;