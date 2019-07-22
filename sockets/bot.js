const axios = require('axios');

var enabledBots = [];
enabledBots.push({
    name: "SimpleBot",
    urlBase: undefined,
    authorizationKey: undefined
});

if (process.env.BOT_DEEPROLE_API_KEY) {
    enabledBots.push({
        name: "DeepRole",
        urlBase: "https://deeprole-proavalon.herokuapp.com/deeprole",
        authorizationKey: process.env.BOT_DEEPROLE_API_KEY
    });
    enabledBots.push({
        name: "DebugRole",
        urlBase: "https://deeprole-proavalon.herokuapp.com/debug",
        authorizationKey: process.env.BOT_DEEPROLE_API_KEY
    });
}

class SimpleBotSocket {
    constructor(username) {
        this.isBotSocket = true;
        this.request = {
            user: {
                username: username,
                bot: true
            }
        }
    }
    // Dummy function needed.
    emit(){};
    
    // handleReadyNotReady: Called when the game is about to start.
    // if the bot is ready, call callback(true)
    // if the bot isn't ready, call callback(false) or callback(false, "<reason>")
    handleReadyNotReady (game, callback) {
        // Simple bots are always ready.
        callback(true);
    }
    
    // handleGameStart: Called when the game has commenced.
    // if the bot initialized successfully, call callback(true)
    // if the bot failed to initialize, call callback(false) or callback(false, "<reason>")
    handleGameStart (game, callback) {
        // Simple bots are always initialized.
        callback(true);
    }
    
    // handleRequestAction: Called when the server is requesting an action from your bot.
    // When you have a move available, call callback with the selected button and players
    // If you errored, call callback(false)
    handleRequestAction (game, availableButtons, availablePlayers, numOfTargets, callback) {
        // Simple bots play randomly
        var buttonPressed = availableButtons[Math.floor(Math.random() * availableButtons.length)];
        if (numOfTargets == 0) {
            callback({
                buttonPressed: buttonPressed
            });
        }
        
        // Progressively remove players until it is the right length
        var selectedPlayers = availablePlayers.slice();
        while (selectedPlayers.length > numOfTargets) {
            selectedPlayers.splice(Math.floor(Math.random() * selectedPlayers.length), 1);
        }
        
        callback({
            buttonPressed: buttonPressed,
            selectedPlayers: selectedPlayers
        });
    }
    
    // handleGameOver: Called when the game finishes or closes
    // If you want to leave the room, call callback(true)
    // Otherwise, call callback(false)
    handleGameOver (game, reason, callback) {
        callback(true);
    }
}

function makeBotAPIRequest(botAPI, method, endpoint, data, timeout) {
    return axios.request({
        method: method,
        url: botAPI.urlBase + endpoint,
        headers: {
            "Authorization": botAPI.authorizationKey,
            "Content-Type": "application/json"
        },
        data: data,
        timeout: timeout || 0
    });
}


function checkBotCapabilities(game, capabilities) {
    // Check if any single capability matches.
    return capabilities.some(function (capability) {
        var numPlayers = game.socketsOfPlayers.length;
        if (capability.numPlayers.indexOf(numPlayers) === -1) {
            return false;
        }
        
        return game.options.every(function(option) {
            return (
                ["Assassin", "Merlin"].indexOf(option) !== -1 ||
                capability.roles.indexOf(option) !== -1 ||
                capability.cards.indexOf(option) !== -1
            );
        });
    });
}
    

class APIBotSocket {
    constructor(username, botAPI) {
        this.isBotSocket = true;
        this.request = {
            user: {
                username: username,
                bot: true
            }
        };
        this.botAPI = botAPI;
    }
    // Dummy function needed.
    emit(){};
    
    // handleReadyNotReady: Called when the game is about to start.
    // if the bot is ready, call callback(true)
    // if the bot isn't ready, call callback(false) or callback(false, "<reason>")
    handleReadyNotReady (game, callback) {
        // Check if the API supports this game type. If yes, ready up.
        makeBotAPIRequest(this.botAPI, 'GET', '/v0/info', {}, 4000).then(function(response) {
            if (response.status !== 200) {
                callback(false, "Bot returned an invalid response.");
                return;
            }
            
            var capabilities = response.data.capabilities;
            
            if (checkBotCapabilities(game, capabilities) === false) {
                callback(false, "Bot doesn't support this game type.");
            } else {
                callback(true);
            }
        }).catch(function(error) {
            if (error.response) {
                callback(false, "The bot crashed during request.");
            } else {
                callback(false, "The bot is no longer online.");
            }
        });
    }
    
    // handleGameStart: Called when the game has commenced.
    // if the bot initialized successfully, call callback(true)
    // if the bot failed to initialize, call callback(false) or callback(false, "<reason>")
    handleGameStart (game, callback) {
        var thisSocket = this;
        var playerIndex = game.playersInGame.findIndex(function(player) { return player.username == thisSocket.request.user.username; });
        // console.log("Player " + thisSocket.request.user.username + " is at index: " + playerIndex); //Don't worry, the above line works perfectly...!
        var gameData = game.getGameData()[playerIndex];
        
        var apiData = {
            numPlayers: gameData.playerUsernamesOrderedReversed.length,
            roles: gameData.roles.filter(function (role) { return role != "Assassin" && role != "Merlin" }), //TODO: Is this needed?
            cards: gameData.cards,
            teamLeader: gameData.teamLeaderReversed,
            players: gameData.playerUsernamesOrderedReversed,
            name: this.request.user.username,
            role: gameData.role,
            see: gameData.see,
        };
        
        makeBotAPIRequest(this.botAPI, 'POST', '/v0/session', apiData, 3000).then(function(response) {
            if (response.status !== 200 || !response.data.sessionID) {
                callback(false, "Bot returned an invalid response.");
                return;
            }
            
            thisSocket.sessionID = response.data.sessionID;
            callback(true);
        }).catch(function(error) {
            if (error.response) {
                callback(false, "The bot crashed during request.");
            } else {
                callback(false, "The bot is no longer online.");
            }
        });
    }
    
    // handleRequestAction: Called when the server is requesting an action from your bot.
    // When you have a move available, call callback with the selected button and players
    // If you errored, call callback(false)
    handleRequestAction (game, availableButtons, availablePlayers, numOfTargets, callback) {
        var thisSocket = this;
        var playerIndex = game.playersInGame.findIndex(function(player) { return player.username == thisSocket.request.user.username; });
        var gameData = game.getGameData()[playerIndex];
        
        var apiData = {
            sessionID: this.sessionID,
            gameInfo: gameData
        };
        
        makeBotAPIRequest(this.botAPI, 'POST', '/v0/session/act', apiData, 20000).then(function(response) {
            if (response.status !== 200) {
                callback(false, "Bot returned an invalid response.");
                return;
            }
            
            callback(response.data);
        }).catch(function(error) {
            if (error.response) {
                callback(false, "The bot crashed during request.");
                // console.log(error.response);
            } else {
                callback(false, "The bot is no longer online.");
            }
        });
    }
    
    // handleGameOver: Called when the game finishes or closes
    // If you want to leave the room, call callback(true)
    // Otherwise, call callback(false)
    handleGameOver (game, reason, callback) {
        var thisSocket = this;
        var playerIndex = game.playersInGame.findIndex(function(player) { return player.username == thisSocket.request.user.username; });
        var gameData = game.getGameData()[playerIndex];
        
        var apiData = {
            sessionID: this.sessionID,
            gameInfo: gameData
        };
        
        makeBotAPIRequest(this.botAPI, 'POST', '/v0/session/gameover', apiData, 1000);
        
        callback(game.phase == "finished");
    }
}

module.exports = {
    enabledBots: enabledBots,
    makeBotAPIRequest: makeBotAPIRequest,
    SimpleBotSocket: SimpleBotSocket,
    APIBotSocket: APIBotSocket
}
