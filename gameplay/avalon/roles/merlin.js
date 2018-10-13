
function Merlin(thisRoom_) {

    this.thisRoom = thisRoom_;

    const role = "Merlin";
    const alliance = "Resistance";
    
    this.test = function(){
        // The following lines running successfully shows that each role file can access
        // the variables and functions from the game room!
        console.log("HII from merlin. The number of sockets is: " + this.thisRoom.allSockets.length);
    }

    this.see = function(){
        
        if(this.thisRoom.gameStarted === true){
            var obj = {};

            var array = [];

            for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
				if (this.thisRoom.playersInGame[i].alliance === "Spy") {

					if (this.thisRoom.playersInGame[i].role === "Mordred") {
						//don't add mordred for Merlin to see
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

}


module.exports = Merlin;