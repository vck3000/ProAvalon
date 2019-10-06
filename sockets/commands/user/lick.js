
module.exports = {
    command: 'lick',
    help: '/lick <playername>: Lick a player.',
    run(globalState, data, senderSocket) {
        const { args } = data;

        data.args[2] = data.args[1];
        data.args[1] = 'lick';

        return actionsObj.userCommands.interactUser.run(globalState, data, senderSocket);
    },
};
