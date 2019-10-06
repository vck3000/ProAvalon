
module.exports = {
    command: 'poke',
    help: '/poke <playername>: poke a player.',
    run(globalState, data, senderSocket) {
        const { args } = data;

        data.args[2] = data.args[1];
        data.args[1] = 'poke';

        return actionsObj.userCommands.interactUser.run(globalState, data, senderSocket);
    },
};
