const usernamesIndexes = require('../myFunctions/usernamesIndexes');

function playersReadyNotReady(minPlayers) {
    this.minPlayers = minPlayers;
}

playersReadyNotReady.prototype.playerReady = function (username) {
    if (this.playersYetToReady.length !== 0) {
        const index = usernamesIndexes.getIndexFromUsername(this.playersYetToReady, username);

        if (index !== -1) {
            this.playersYetToReady.splice(index, 1);
            if (this.playersYetToReady.length === 0 && this.canJoin === false) {
                // say to spectators that the ready/notready phase is over
                const socketsOfSpecs = this.getSocketsOfSpectators();
                socketsOfSpecs.forEach((sock) => {
                    sock.emit('spec-game-starting-finished', null);
                });

                if (this.startGame(this.options) === true) {
                    return true;
                }

                return false;
            }

            return false;
        }
    }
};

playersReadyNotReady.prototype.playerNotReady = function (username) {
    if (this.playersYetToReady.length !== 0) {
        this.playersYetToReady = [];
        this.canJoin = true;

        const socketsOfSpecs = this.getSocketsOfSpectators();
        socketsOfSpecs.forEach((sock) => {
            sock.emit('spec-game-starting-finished', null);
        });

        return username;
    }
};

playersReadyNotReady.prototype.hostTryStartGame = function (options, gameMode) {
    // Must have at least one bot in the game to play a "bot" gameMode
    if (gameMode.toLowerCase().includes('bot') === true && (this.botSockets === undefined || this.botSockets.length === 0)) {
        this.sendText(this.allSockets, 'Please play in a normal game mode if you do not have any bots.', 'gameplay-text');
        return false;
    }
    if (gameMode.toLowerCase().includes('bot') === false && this.botSockets !== undefined && this.botSockets.length !== 0) {
        this.sendText(this.allSockets, 'You cannot have bots play in normal game modes. Please use a bot game mode.', 'gameplay-text');
        return false;
    }

    // console.log("HOST TRY START GAME");
    if (this.hostTryStartGameDate) {
        // 11 seconds
        if (new Date() - this.hostTryStartGameDate > 1000 * 11) {
            this.canJoin = true;
            this.playersYetToReady = [];
        }
    }

    if (this.canJoin === true) {
        // check before starting
        if (this.socketsOfPlayers.length < this.minPlayers) {
            // NEED AT LEAST FIVE PLAYERS, SHOW ERROR MESSAGE BACK
            // console.log("Not enough players.");
            this.socketsOfPlayers[0].emit('danger-alert', 'Minimum 5 players to start. ');
            return false;
        } if (this.gameStarted === true) {
            // console.log("Game already started!");
            return false;
        }

        this.hostTryStartGameDate = new Date();

        // makes it so that others cannot join the room anymore
        this.canJoin = false;

        // .slice to clone
        this.playersYetToReady = this.socketsOfPlayers.slice();

        this.options = options;

        // If there are bots, check if they are ready.
        // This step has to be done on the next event loop cycle to ensure the code below it runs.
        const thisGame = this;
        setImmediate(() => {
            thisGame.socketsOfPlayers.forEach((playerSocket) => {
                if (playerSocket.isBotSocket) {
                    playerSocket.handleReadyNotReady(thisGame, function (botReady, reason) {
                        if (botReady) {
                            thisGame.playerReady(playerSocket.request.user.username);
                        } else {
                            let message = `${playerSocket.request.user.username} is not ready.`;
                            if (reason) {
                                message += ` Reason: ${reason}`;
                            }
                            thisGame.sendText(this.allSockets, message, 'server-text');
                            thisGame.playerNotReady(playerSocket.request.user.username);
                        }
                    });
                }
            });
        });

        this.gamePlayerLeftDuringReady = false;

        let rolesInStr = '';
        options.forEach((element) => {
            rolesInStr += `${element}, `;
        });
        // remove the last , and replace with .
        rolesInStr = rolesInStr.slice(0, rolesInStr.length - 2);
        rolesInStr += '.';

        for (let i = 0; i < this.socketsOfPlayers.length; i++) {
            this.socketsOfPlayers[i].emit('game-starting', rolesInStr, gameMode);
        }

        const socketsOfSpecs = this.getSocketsOfSpectators();
        socketsOfSpecs.forEach((sock) => {
            sock.emit('spec-game-starting', null);
        });
        this.sendText(this.allSockets, 'The game is starting!', 'gameplay-text');
    }
};


// Misc functions
function getRolesInStr(options) {
    let str = '';

    if (options.merlin === true) { str += 'Merlin, '; }
    if (options.assassin === true) { str += 'Assassin, '; }
    if (options.percival === true) { str += 'Percival, '; }
    if (options.morgana === true) { str += 'Morgana, '; }
    if (options.mordred === true) { str += 'Mordred, '; }
    if (options.oberon === true) { str += 'Oberon, '; }
    if (options.lady === true) { str += 'Lady of the Lake, '; }

    // remove the last , and replace with .
    str = str.slice(0, str.length - 2);
    str += '.';

    return str;
}


module.exports = playersReadyNotReady;
