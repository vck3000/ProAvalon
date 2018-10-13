
function Percival(thisRoom_) {

    this.thisRoom = thisRoom_;

    this.role = "Percival";
    this.alliance = "Resistance";
    
    this.test = function(){
        // The following lines running successfully shows that each role file can access
        // the variables and functions from the game room!
        console.log("HII from Percival. I will send messages to players through socket.emit()");
        var data = {
            message: "LOLOL FROM PERCY",
            classStr: "server-text"
        }


        this.thisRoom.io.in(this.thisRoom.roomId).emit("roomChatToClient", data);
        
    }

    this.see = function(){
        
        if(thisRoom.gameStarted === true){
            var obj = {};

            var array = [];

            for (var i = 0; i < thisRoom.playersInGame.length; i++) {
				if (thisRoom.playersInGame[i].alliance === "Spy") {

					if (thisRoom.playersInGame[i].role === "Mordred") {
						//don't add mordred for Merlin to see
					}
					else {
						//add the spy
						array.push(thisRoom.playersInGame[i].username);
					}
				}
            }
            
            obj.spies = array;
            return obj;
        }
    }

}


module.exports = Percival;