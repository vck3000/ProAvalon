var usernamesIndexes = require("../../../myFunctions/usernamesIndexes");

function Assassin(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.specialPhase = "assassination";

    this.role = "Assassin";
    this.alliance = "Spy";

    this.playerShot = "";

    //Assassin sees all spies except oberon
    this.see = function(){
        if(this.thisRoom.gameStarted === true){
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
};

//Assassination phase
Assassin.prototype.checkSpecialMove = function(socket, data){
    //Check for assassination mode and enter it if it is the right time
    if(this.playerShot === ""){
        // If we have the right conditions, we go into assassination phase
        if(this.thisRoom.phase === "finished"){
            //Get the number of successes:
            var numOfSuccesses = 0;

            for(var i = 0; i < this.thisRoom.missionHistory.length; i++){
                if(this.thisRoom.missionHistory[i] === "succeeded"){
                    numOfSuccesses++;
                }
            }

            if(numOfSuccesses === 3){
                // Set the assassination phase
                this.thisRoom.phase = this.specialPhase;
                return true;
            }
        }
    }
};

Assassin.prototype.getPublicGameData = function(){
    if( this.playerShot !== ""){
        return { assassinShotUsername: this.playerShot };
    }
    else {
        return null;
    }
}


module.exports = Assassin;