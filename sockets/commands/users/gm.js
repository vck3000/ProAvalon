
module.exports = {
    command: 'gm',
    help: '/gm <playername>: Shortcut for /guessmerlin',
    run(data, senderSocket) {
        return actionsObj.userCommands.guessmerlin.run(data, senderSocket);
    },
};
