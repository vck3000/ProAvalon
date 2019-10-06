exports.SimpleBotSocket = require('./SimpleBotSocket');
exports.APIBotSocket = require('./APIBotSocket');
exports.makeBotAPIRequest = require('./util').makeBotAPIRequest;

exports.enabledBots = [
    {
        name: 'SimpleBot',
        urlBase: undefined,
        authorizationKey: undefined,
    },
];

// Temporarily disable bots
// if (process.env.BOT_DEEPROLE_API_KEY) {
//     enabledBots.push({
//         name: 'DeepRole',
//         urlBase: 'https://deeprole-proavalon.herokuapp.com/deeprole',
//         authorizationKey: process.env.BOT_DEEPROLE_API_KEY,
//     });
//     enabledBots.push({
//         name: 'DebugRole',
//         urlBase: 'https://deeprole-proavalon.herokuapp.com/debug',
//         authorizationKey: process.env.BOT_DEEPROLE_API_KEY,
//     });
// }
