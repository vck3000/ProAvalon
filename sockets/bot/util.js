const axios = require('axios');

exports.makeBotAPIRequest = (botAPI, method, endpoint, data, timeout) => axios.request({
    method,
    url: botAPI.urlBase + endpoint,
    headers: {
        Authorization: botAPI.authorizationKey,
        'Content-Type': 'application/json',
    },
    data,
    timeout: timeout || 0,
});

// Check if any single capability matches.
exports.checkBotCapabilities = (game, capabilities) => capabilities.some((capability) => {
    const numPlayers = game.socketsOfPlayers.length;
    if (capability.numPlayers.indexOf(numPlayers) === -1) {
        return false;
    }

    return game.options.every((option) => (
        ['Assassin', 'Merlin'].indexOf(option) !== -1
          || capability.roles.indexOf(option) !== -1
          || capability.cards.indexOf(option) !== -1
    ));
});
