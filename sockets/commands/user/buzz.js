const interactUser = require('./interactUser');

module.exports = {
    command: 'buzz',
    help: '/buzz <playername>: Buzz a player.',
    run(globalState, data, senderSocket) {
        data.args = [data.args[0], 'buzz', data.args[1]];
        return interactUser.run(globalState, data, senderSocket);
    },
};
