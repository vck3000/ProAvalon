
function Spy(thisRoom_) {

    this.thisRoom = thisRoom_;

    this.role = "Spy";
    this.alliance = "Spy";

    this.description = "A standard Spy member.";

    //Spy sees all spies except oberon
    this.see = function () {
        if (this.thisRoom.gameStarted) {
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
    };

    this.checkSpecialMove = function () {

    };
}


module.exports = Spy;