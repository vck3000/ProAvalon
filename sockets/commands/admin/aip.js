const { getIndexFromUsername } = require('../../util');

module.exports = {
    command: 'aip',
    help: '/aip <player name>: Get the ip of the player.',
    async run(globalState, data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
            return { message: 'Specify a username.', classStr: 'server-text' };
        }

        const slapSocket = globalState.allSockets[getIndexFromUsername(globalState.allSockets, args[1])];
        if (slapSocket) {
            const clientIpAddress = slapSocket.request.headers['x-forwarded-for'] || slapSocket.request.connection.remoteAddress;

            senderSocket.emit('messageCommandReturnStr', { message: clientIpAddress, classStr: 'server-text' });

            return { message: 'slapSocket.request.user.username', classStr: 'server-text' };
        }

        senderSocket.emit('messageCommandReturnStr', { message: 'No IP found or invalid username', classStr: 'server-text' });

        return { message: 'There is no such player.', classStr: 'server-text' };
    },
};
