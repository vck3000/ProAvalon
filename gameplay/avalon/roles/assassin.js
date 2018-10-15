var usernamesIndexes = require("../../../myFunctions/usernamesIndexes");

function Assassin(thisRoom_) {

    this.thisRoom = thisRoom_;

    this.specialPhase = "assassination";

    this.role = "Assassin";
    this.alliance = "Spy";

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

Assassin.prototype.isSpecialPhase = function(){
    if(this.thisRoom.phase === this.specialPhase){
        return true;
    }
    else{
        return null;
    }
};

//Assassination phase
Assassin.prototype.checkSpecialMove = function(socket, data){

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
            this.thisRoom.phase = this.specialPhase;
            return true;
        }
    }

    // If its already assassination phase, then carry out the assassination move
    else if(this.isSpecialPhase() && socket && data){
        if(typeof(data) === "object" || typeof(data) === "array"){
            data = data[0];
        }
        // Check that the person making this request is the assassin
        var indexOfRequester = usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, socket.request.user.username);
        if(this.thisRoom.playersInGame[indexOfRequester].role === this.role){
            var indexOfTarget = usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, data);

            // Get merlin's username
            var merlinUsername = undefined;
			for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
				if (this.thisRoom.playersInGame[i].role === "Merlin") {
					merlinUsername = this.thisRoom.playersInGame[i].username;
				}
            }
            
            if(indexOfTarget !== -1){
                if(this.thisRoom.playersInGame[indexOfTarget].role === "Merlin"){
                    this.thisRoom.winner = "Spy";
                    this.thisRoom.howWasWon = "Assassinated Merlin correctly.";

                    this.thisRoom.sendText(this.thisRoom.allSockets, "The assassin has shot " + merlinUsername + "! They were correct!", classStr="gameplay-text-red");
                }
                else {
                    this.thisRoom.winner = "Resistance";
                    this.thisRoom.howWasWon = "Mission successes and Merlin did not die.";

                    this.thisRoom.sendText(this.thisRoom.allSockets, "The assassin has shot " + target[0] + "! " + target[0] + " was not merlin, " + merlinUsername + " was!" , classStr="gameplay-text-blue");
                }

                //For gameRecord - get the role that was shot
                for(var i = 0; i < playerRoles.length; i++){
                    if(playerRoles[i].username === target[0]){
                        this.thisRoom.whoAssassinShot = playerRoles[i].role;
                        break;
                    }
                }
            }
            else{
                console.log(data);
		        socket.emit("danger-alert", "Bad assassination data. Tell the admin if you see this!");
            }
        }
    }
};



Assassin.prototype.toShowGuns = function(){
    if(this.isSpecialPhase()){
        return true;
    }
    else{
        return null;
    }
};

Assassin.prototype.getClientNumOfTargets = function(indexOfPlayer){

    if(indexOfPlayer !== undefined && indexOfPlayer !== null){
        if(this.isSpecialPhase() && this.thisRoom.playersInGame[indexOfPlayer].role === this.role){
            return 1;
        }
        else{
            return null;
        }
    }

};




Assassin.prototype.getClientButtonSettings = function(indexOfPlayer){
    if(this.isSpecialPhase()){
        //Get the index of the assassin
        var indexOfAssassin = -1;
        for(var i = 0; i < this.thisRoom.playersInGame.length; i++){
            if(this.thisRoom.playersInGame[i].role === this.role){
                indexOfAssassin = i;
            }
        }

        var obj = {
            green: {},
            red: {}
        };

        if(indexOfPlayer === indexOfAssassin){
            obj.green.hidden = false;
            obj.green.disabled = true;
            obj.green.setText = "Shoot";

            obj.red.hidden = true;
            obj.red.disabled = true;
            obj.red.setText = "";
        }
        // If it is any other player who isn't special role
        else{
            obj.green.hidden = true;
            obj.green.disabled = true;
            obj.green.setText = "";

            obj.red.hidden = true;
            obj.red.disabled = true;
            obj.red.setText = "";
        }
        return obj;
    }
    return null;
};

Assassin.prototype.getStatusMessage = function(indexOfPlayer){
    if(this.isSpecialPhase()){
        //Get the index of the assassin
        var indexOfAssassin = -1;
        for(var i = 0; i < this.thisRoom.playersInGame.length; i++){
            if(this.thisRoom.playersInGame[i].role === this.role){
                indexOfAssassin = i;
            }
        }

        var obj = {};

        if(indexOfPlayer === indexOfAssassin){
            return "Shoot Merlin..."
        }
        // If it is any other player who isn't special role
        else{
            var usernameOfAssassin = this.thisRoom.playersInGame[indexOfAssassin].username;
            return "Waiting for " + usernameOfAssassin + " to assassinate Merlin."
        }
    }
    return null;
};



module.exports = Assassin;