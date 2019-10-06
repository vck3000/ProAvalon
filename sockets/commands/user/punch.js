const interactUser = require('./interactUser');

module.exports = {
    command: 'punch',
    help: '/punch <playername>: punch a player.',
    run(globalState, data, senderSocket) {
        data.args = [data.args[0], 'punch', data.args[1]];
        return interactUser.run(globalState, data, senderSocket);
    },
};
