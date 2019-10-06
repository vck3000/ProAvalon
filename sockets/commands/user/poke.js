const interactUser = require('./interactUser');

module.exports = {
    command: 'poke',
    help: '/poke <playername>: poke a player.',
    run(globalState, data, senderSocket) {
        const args = [data.args[0], 'poke', data.args[1]];
        return interactUser.run(globalState, args, senderSocket);
    },
};
