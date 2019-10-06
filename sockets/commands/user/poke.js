const interactUser = require('./interactUser');

module.exports = {
    command: 'poke',
    help: '/poke <playername>: poke a player.',
    run(globalState, data, senderSocket) {
        data.args = [data.args[0], 'poke', data.args[1]];
        return interactUser.run(globalState, data, senderSocket);
    },
};
