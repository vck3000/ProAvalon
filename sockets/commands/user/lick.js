const interactUser = require('./interactUser');

module.exports = {
    command: 'lick',
    help: '/lick <playername>: Lick a player.',
    run(globalState, data, senderSocket) {
        data.args = [data.args[0], 'lick', data.args[1]];
        return interactUser.run(globalState, data, senderSocket);
    },
};
