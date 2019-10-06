
module.exports = {
    command: 'punch',
    help: '/punch <playername>: punch a player.',
    run(globalState, data, senderSocket) {
        const { args } = data;

        data.args[2] = data.args[1];
        data.args[1] = 'punch';

        return actionsObj.userCommands.interactUser.run(globalState, data, senderSocket);
    },
};
