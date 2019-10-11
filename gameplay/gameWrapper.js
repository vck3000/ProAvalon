// This wrapper mainly serves as a way to detect and make callbacks
// to the socket.js file for updates.
const Game = require('./game');

function GameWrapper(host_, roomId_, io_, maxNumPlayers_, newRoomPassword_, gameMode_, callback_) {
    // Get all the game properties
    Game.call(this, host_, roomId_, io_, maxNumPlayers_, newRoomPassword_, gameMode_, callback_)
}

// GameWrapper inherits all the functions and stuff from Room
GameWrapper.prototype = Object.create(Game.prototype);

//------------------------------------------------
// METHOD OVERRIDES ------------------------------
//------------------------------------------------

// Note: when saving arrays for comparison be sure to take by value instead of by reference.
GameWrapper.prototype.playerSitDown = function (socket) {
    // Store the players in the game before and after to check if a player actually sits.
    const beforePlayers = this.playersInGame.slice(0);

    Game.prototype.playerSitDown.call(this, socket);

    // If the players in the game have changed, callback to update games list.
    if (beforePlayers != this.playersInGame) {
        this.callback("updateCurrentGamesList");
    }
};

GameWrapper.prototype.playerStandUp = function (socket) {
    // Store the players in the game before and after to check if a player actually stands.
    const beforePlayers = this.playersInGame.slice(0);

    Game.prototype.playerStandUp.call(this, socket);

    // If the players in the game have changed, callback to update games list.
    if (beforePlayers != this.playersInGame) {
        this.callback("updateCurrentGamesList");
    }
};

GameWrapper.prototype.startGame = function (options) {
    const gameStarted = Game.prototype.startGame.call(this, options);
    
    // If the game actually started, callback to update the games list.
    if (gameStarted) {
        this.callback("updateCurrentGamesList");
    }
};

GameWrapper.prototype.gameMove = function (socket, data) {
    // Game moves that change these attributes require callbacks.
    beforeNum = this.missionNum;

    Game.prototype.gameMove.call(this, socket, data);

    // If the mission number has changed, callback to update the games list.
    if (beforeNum != this.missionNum) {
        this.callback("updateCurrentGamesList");
    }
};

// No need to track phase, a call to finishGame always causes the phase of the game to change to finished.
GameWrapper.prototype.finishGame = function(toBeWinner) {
    Game.prototype.finishGame.call(this, toBeWinner);

    // If the game actually finished, then run callbacks.
    if (this.finished === true) {
        // Callbacks for announcing winner in all chat.
        if (this.winner === 'Spy') {
            this.callback("finishGameSpyWin", this); 
        }
        else if (this.winner === 'Resistance') {
            this.callback("finishGameResWin", this); 
        }
        else {
            // Something went wrong...
            throw new ReferenceError(`${this.winner} was not recognised as a winner.`);
        }

        // Callback for updating the games list.
        this.callback("updateCurrentGamesList");
    }
};


module.exports = GameWrapper;