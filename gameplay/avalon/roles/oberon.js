

function Oberon(thisRoom_) {

    this.thisRoom = thisRoom_;

    this.role = "Oberon";
    this.alliance = "Spy";

    //Oberon only sees him/herself
    this.see = function(){
        if(this.thisRoom.gameStarted === true){
            var obj = {};
            var array = [];

            for (var i = 0; i < this.playersInGame.length; i++) {
                if (this.playersInGame[i].role === "Oberon") {
                    array.push(this.playersInGame[i].username);
                    break;
                }
            }
            
            obj.spies = array;
            return obj;
        }
    }

    this.checkSpecialMove = function(){
        
    }

}


module.exports = Oberon;