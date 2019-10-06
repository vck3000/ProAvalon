const { makeBotAPIRequest, checkBotCapabilities } = require('./util');

class APIBotSocket {
    constructor(username, botAPI) {
        this.isBotSocket = true;
        this.request = {
            user: {
                username,
                bot: true,
            },
        };
        this.botAPI = botAPI;
    }

    // Dummy function needed.
    emit() { }

    // handleReadyNotReady: Called when the game is about to start.
    // if the bot is ready, call callback(true)
    // if the bot isn't ready, call callback(false) or callback(false, "<reason>")
    handleReadyNotReady(game, callback) {
        // Check if the API supports this game type. If yes, ready up.
        makeBotAPIRequest(this.botAPI, 'GET', '/v0/info', {}, 4000).then((response) => {
            if (response.status !== 200) {
                callback(false, 'Bot returned an invalid response.');
                return;
            }

            const { capabilities } = response.data;

            if (checkBotCapabilities(game, capabilities) === false) {
                callback(false, "Bot doesn't support this game type.");
            } else {
                callback(true);
            }
        }).catch((error) => {
            if (error.response) {
                callback(false, 'The bot crashed during request.');
            } else {
                callback(false, 'The bot is no longer online.');
            }
        });
    }

    // handleGameStart: Called when the game has commenced.
    // if the bot initialized successfully, call callback(true)
    // if the bot failed to initialize, call callback(false) or callback(false, "<reason>")
    handleGameStart(game, callback) {
        const thisSocket = this;
        const playerIndex = game.playersInGame.findIndex((player) => player.username === thisSocket.request.user.username);
        // console.log("Player " + thisSocket.request.user.username + " is at index: " + playerIndex); //Don't worry, the above line works perfectly...!
        const gameData = game.getGameData()[playerIndex];

        const apiData = {
            numPlayers: gameData.playerUsernamesOrderedReversed.length,
            roles: gameData.roles.filter((role) => role !== 'Assassin' && role !== 'Merlin'), // TODO: Is this needed?
            cards: gameData.cards,
            teamLeader: gameData.teamLeaderReversed,
            players: gameData.playerUsernamesOrderedReversed,
            name: this.request.user.username,
            role: gameData.role,
            see: gameData.see,
        };

        makeBotAPIRequest(this.botAPI, 'POST', '/v0/session', apiData, 3000).then((response) => {
            if (response.status !== 200 || !response.data.sessionID) {
                callback(false, 'Bot returned an invalid response.');
                return;
            }

            thisSocket.sessionID = response.data.sessionID;
            callback(true);
        }).catch((error) => {
            if (error.response) {
                callback(false, 'The bot crashed during request.');
            } else {
                callback(false, 'The bot is no longer online.');
            }
        });
    }

    // handleRequestAction: Called when the server is requesting an action from your bot.
    // When you have a move available, call callback with the selected button and players
    // If you errored, call callback(false)
    handleRequestAction(game, availableButtons, availablePlayers, numOfTargets, callback) {
        const thisSocket = this;
        const playerIndex = game.playersInGame.findIndex((player) => player.username === thisSocket.request.user.username);
        const gameData = game.getGameData()[playerIndex];

        const apiData = {
            sessionID: this.sessionID,
            gameInfo: gameData,
        };

        makeBotAPIRequest(this.botAPI, 'POST', '/v0/session/act', apiData, 20000).then((response) => {
            if (response.status !== 200) {
                callback(false, 'Bot returned an invalid response.');
                return;
            }

            callback(response.data);
        }).catch((error) => {
            if (error.response) {
                callback(false, 'The bot crashed during request.');
                // console.log(error.response);
            } else {
                callback(false, 'The bot is no longer online.');
            }
        });
    }

    // handleGameOver: Called when the game finishes or closes
    // If you want to leave the room, call callback(true)
    // Otherwise, call callback(false)
    handleGameOver(game, reason, callback) {
        const thisSocket = this;
        const playerIndex = game.playersInGame.findIndex((player) => player.username === thisSocket.request.user.username);
        const gameData = game.getGameData()[playerIndex];

        const apiData = {
            sessionID: this.sessionID,
            gameInfo: gameData,
        };

        makeBotAPIRequest(this.botAPI, 'POST', '/v0/session/gameover', apiData, 1000);

        callback(game.phase === 'finished');
    }
}

module.exports = APIBotSocket;
