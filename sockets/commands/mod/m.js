module.exports = {
    command: 'm',
    help: '/m: displays /mhelp',
    run(globalState, data, senderSocket) {
        return actionsObj.modCommands.mhelp.run(globalState, data, senderSocket);
    },
};
