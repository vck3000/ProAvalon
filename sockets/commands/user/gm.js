const guessmerlin = require('./guessmerlin');

module.exports = {
    command: 'gm',
    help: '/gm <playername>: Shortcut for /guessmerlin',
    run(globalState, data, senderSocket) {
        return guessmerlin.run(globalState, data, senderSocket);
    },
};
