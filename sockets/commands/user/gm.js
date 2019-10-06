
module.exports = {
    command: 'gm',
    help: '/gm <playername>: Shortcut for /guessmerlin',
    run(globalState, data, senderSocket) {
        return actionsObj.userCommands.guessmerlin.run(globalState, data, senderSocket);
    },
};
