const mhelp = require('./mhelp');

module.exports = {
    command: 'm',
    help: '/m: displays /mhelp',
    run(globalState, data, senderSocket) {
        return mhelp.run(globalState, data, senderSocket);
    },
};
