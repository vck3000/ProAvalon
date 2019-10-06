const interactUser = require('./interactUser');

module.exports = {
    command: 'slap',
    help: '/slap <playername>: Slap a player for fun.',
    run(globalState, data, senderSocket) {
        const args = [data.args[0], 'slap', data.args[1]];
        return interactUser.run(globalState, args, senderSocket);
    },
};
