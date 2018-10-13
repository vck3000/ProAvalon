var usernamesIndexes = require("../myFunctions/usernamesIndexes");

function playersReadyNotReady(minPlayers) {


    this.playerReady = function (username) {
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
    }

    this.playerNotReady = function (username) {
        if(this.playersYetToReady.length !== 0){
            this.playersYetToReady = [];
            this.canJoin = true;

            var socketsOfSpecs = this.getSocketsOfSpectators();
            socketsOfSpecs.forEach(function(sock){
                sock.emit("spec-game-starting-finished", null);
            });
            
            return username;
        }
    }

    this.hostTryStartGame = function (options) {
        if(this.hostTryStartGameDate){
            // 11 seconds
            if(new Date - this.hostTryStartGameDate > 1000*11){
                this.canJoin = true;
                this.playersYetToReady = [];
            }
        }

        if (this.canJoin === true) {
            //check before starting
            if (this.socketsSittingDown.length < minPlayers) {
                //NEED AT LEAST FIVE PLAYERS, SHOW ERROR MESSAGE BACK
                // console.log("Not enough players.");
                this.socketsSittingDown[0].emit("danger-alert", "Minimum 5 players to start. ")
                return false;
            } else if (this.gameStarted === true) {
                // console.log("Game already started!");
                return false;
            }

            this.hostTryStartGameDate = new Date();

            //makes it so that others cannot join the room anymore
            this.canJoin = false;

            //.slice to clone
            this.playersYetToReady = this.socketsSittingDown.slice();

            for(var i = this.playersYetToReady.length - 1; i >= 0 ; i--){
                username = this.playersYetToReady[i].request.user.username;

                if( username.includes("Bot") ){
                    this.playersYetToReady.splice(i, 1);
                }
            }

            this.options = options;

            this.gamePlayerLeftDuringReady = false;

            var rolesInStr = getRolesInStr(options);

            for (var i = 0; i < this.socketsSittingDown.length; i++) {
                this.socketsSittingDown[i].emit("game-starting", rolesInStr);
            }

            var socketsOfSpecs = this.getSocketsOfSpectators();
            socketsOfSpecs.forEach(function(sock){
                sock.emit("spec-game-starting", null);
            });
            this.sendText(this.allSockets, "The game is starting!", "gameplay-text");
        }
    }
}

// Misc functions
function getRolesInStr(options) {

	var str = "";

	if (options.merlinassassin === true) { str += "Merlin, Assassin, " }
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