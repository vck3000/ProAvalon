
module.exports = {
    command: 'aip',
    help: '/aip <player name>: Get the ip of the player.',
    async run(data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
            // console.log("a");
            senderSocket.emit('messageCommandReturnStr', { message: 'Specify a username', classStr: 'server-text' });
            return { message: 'Specify a username.', classStr: 'server-text' };
        }


        const slapSocket = allSockets[getIndexFromUsername(allSockets, args[1])];
        if (slapSocket) {
            // console.log("b");
            const clientIpAddress = slapSocket.request.headers['x-forwarded-for'] || slapSocket.request.connection.remoteAddress;

            senderSocket.emit('messageCommandReturnStr', { message: clientIpAddress, classStr: 'server-text' });

            return { message: 'slapSocket.request.user.username', classStr: 'server-text' };
        }

        // console.log("c");

        senderSocket.emit('messageCommandReturnStr', { message: 'No IP found or invalid username', classStr: 'server-text' });

        return { message: 'There is no such player.', classStr: 'server-text' };
    },
};
