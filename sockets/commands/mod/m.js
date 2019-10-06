module.exports = {
    command: 'm',
    help: '/m: displays /mhelp',
    run(data, senderSocket) {
        return actionsObj.modCommands.mhelp.run(data, senderSocket);
    },
};
