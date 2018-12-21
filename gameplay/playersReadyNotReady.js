var usernamesIndexes = require("../myFunctions/usernamesIndexes");

function playersReadyNotReady(minPlayers) {
    this.minPlayers = minPlayers;
}

playersReadyNotReady.prototype.playerReady = function (username) {
    if(this.playersYetToReady.length !== 0){
        var index = usernamesIndexes.getIndexFromUsername(this.playersYetToReady, username);

        if(index !== -1){
            this.playersYetToReady.splice(index, 1);
            if (this.playersYetToReady.length === 0 && this.canJoin === false) {
                //say to spectators that the ready/notready phase is over
                var socketsOfSpecs = this.getSocketsOfSpectators();
                socketsOfSpecs.forEach(function(sock){
                    sock.emit("spec-game-starting-finished", null);
                });

                if (this.startGame(this.options) === true) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
    }
};

playersReadyNotReady.prototype.playerNotReady = function (username) {
    if(this.playersYetToReady.length !== 0){
        this.playersYetToReady = [];
        this.canJoin = true;

        var socketsOfSpecs = this.getSocketsOfSpectators();
        socketsOfSpecs.forEach(function(sock){
            sock.emit("spec-game-starting-finished", null);
        });
        
        return username;
    }
};

playersReadyNotReady.prototype.hostTryStartGame = function (options, gameMode) {
    // console.log("HOST TRY START GAME");
    if(this.hostTryStartGameDate){
        // 11 seconds
        if(new Date - this.hostTryStartGameDate > 1000*11){
            this.canJoin = true;
            this.playersYetToReady = [];
        }
    }

    if (this.canJoin === true) {
        //check before starting
        if (this.socketsOfPlayers.length < this.minPlayers) {
            //NEED AT LEAST FIVE PLAYERS, SHOW ERROR MESSAGE BACK
            // console.log("Not enough players.");
            this.socketsOfPlayers[0].emit("danger-alert", "Minimum 5 players to start. ");
            return false;
        } else if (this.gameStarted === true) {
            // console.log("Game already started!");
            return false;
        }

        this.hostTryStartGameDate = new Date();

        //makes it so that others cannot join the room anymore
        this.canJoin = false;

        //.slice to clone
        this.playersYetToReady = this.socketsOfPlayers.slice();

        // If there are bots, remove them.
        for(var i = this.playersYetToReady.length - 1; i >= 0 ; i--){
            if( this.playersYetToReady[i].request.user.bot === true ){
                // console.log("Removed bot: " + i);
                this.playersYetToReady.splice(i, 1);
            }
        }
        this.options = options;

        // If the room is full of bots, start game
        if(this.playersYetToReady.length === 0){
            this.startGame(options);
        }
        else{
            this.gamePlayerLeftDuringReady = false;
    
            var rolesInStr = "";
            options.forEach(function(element){
                rolesInStr += element + ", ";
            });
            //remove the last , and replace with .
            rolesInStr = rolesInStr.slice(0, rolesInStr.length - 2);
            rolesInStr += ".";
    
            for (var i = 0; i < this.socketsOfPlayers.length; i++) {
                this.socketsOfPlayers[i].emit("game-starting", rolesInStr, gameMode);
            }
    
            var socketsOfSpecs = this.getSocketsOfSpectators();
            socketsOfSpecs.forEach(function(sock){
                sock.emit("spec-game-starting", null);
            });
            this.sendText(this.allSockets, "The game is starting!", "gameplay-text");
        }
    }
};


// Misc functions
function getRolesInStr(options) {

	var str = "";

    if (options.merlin === true) { str += "Merlin, " }
    if (options.assassin === true) { str += "Assassin, " }
	if (options.percival === true) { str += "Percival, "; }
	if (options.morgana === true) { str += "Morgana, "; }
	if (options.mordred === true) { str += "Mordred, "; }
	if (options.oberon === true) { str += "Oberon, "; }
	if (options.lady === true) { str += "Lady of the Lake, "; }

	//remove the last , and replace with .
	str = str.slice(0, str.length - 2);
	str += ".";

	return str;
}


module.exports = playersReadyNotReady;