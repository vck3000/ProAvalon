
module.exports = {
    command: 'slap',
    help: '/slap <playername>: Slap a player for fun.',
    run(data, senderSocket) {
        const { args } = data;

        data.args[2] = data.args[1];
        data.args[1] = 'slap';

        return actionsObj.userCommands.interactUser.run(data, senderSocket);
    },
};
