const axios = require('axios');
const { enabledBots, makeBotAPIRequest } = require('../../bot');

module.exports = {
    command: 'getbots',
    help: '/getbots: Run this in a bot-compatible room. Prints a list of available bots to add, as well as their supported game modes',
    run(globalState, data, senderSocket) {
        senderSocket.emit('messageCommandReturnStr', {
            message: 'Fetching bots...',
            classStr: 'server-text',
        });

        const botInfoRequests = enabledBots.map((botAPI) => makeBotAPIRequest(botAPI, 'GET', '/v0/info', {}, 2000).then((response) => {
            if (response.status !== 200) {
                return null;
            }
            return {
                name: botAPI.name,
                info: response.data,
            };
        }).catch((err) => { console.log(err); }));

        axios.all(botInfoRequests).then((botInfoResponses) => {
            const botDescriptions = botInfoResponses.filter((result) => result != null).map((result) => `${result.name} - ${JSON.stringify(result.info.capabilities)}`);

            // Hard code this in... (unshift pushes to the start of the array)
            botDescriptions.unshift('SimpleBot - Random playing bot...');

            if (botDescriptions.length === 0) {
                senderSocket.emit('messageCommandReturnStr', {
                    message: 'No bots are currently available.',
                    classStr: 'server-text',
                });
            } else {
                const messages = ['The following bots are online:'].concat(botDescriptions);
                senderSocket.emit('messageCommandReturnStr', messages.map((message) => ({
                    message,
                    classStr: 'server-text',
                })));
            }
        });
    },
};
