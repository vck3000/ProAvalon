
module.exports = {
    command: 'buzz',
    help: '/buzz <playername>: Buzz a player.',
    run(globalState, data, senderSocket) {
        const { args } = data;

        data.args[2] = data.args[1];
        data.args[1] = 'buzz';

        return actionsObj.userCommands.interactUser.run(globalState, data, senderSocket);
    },
};
