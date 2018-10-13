
function Percival() {

    this.role = "Percival";
    this.alliance = "Resistance";
    
    this.test = function(){
        console.log("HII from Percival");
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