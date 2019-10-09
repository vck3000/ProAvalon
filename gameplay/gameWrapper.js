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

// Note: since GameWrapper inherits Game which inherits Room, we can still override Room functions.

// Simple example of overriding
GameWrapper.prototype.playerJoinRoom = function (socket, inputPassword) {
    // console.log("Override!");
    // console.log(this.host);
    // console.log(this.winner);
    Game.prototype.playerJoinRoom.call(this, socket, inputPassword);
}

// Note: Since we know that finishGame, when run, will always result in a game finish, 
// we don't need to record the previous state. But as an example, this is how you could
// generally approach any callback problem.
GameWrapper.prototype.finishGame = function(toBeWinner) {
    // Here, we are tracking the phase. If the phase has changed from before and is now 
    // 'finished', then make a callback.
    var before = this.phase;
    Game.prototype.finishGame.call(this, toBeWinner);
    var after = this.phase;

    // If the changes are such that we require a callback, then make one.
    if (before != after && after === 'finished') {
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
    }
}



module.exports = GameWrapper;