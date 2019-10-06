const { SimpleBotSocket } = require('../../bot');

module.exports = {
    command: 'maddbots',
    help: '/maddbots <number>: Add <number> bots to the room.',
    run(globalState, data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
            senderSocket.emit('messageCommandReturnStr', { message: 'Specify a number.', classStr: 'server-text' });
            return;
        }

        const room = globalState.rooms[senderSocket.request.user.inRoomId];
        if (!room) return;

        const dummySockets = [];

        for (let i = 0; i < args[1]; i += 1) {
            const botName = `SimpleBot#${Math.floor(Math.random() * 100)}`;

            // Avoid a username clash!
            const currentUsernames = room.socketsOfPlayers.map((sock) => sock.request.user.username);
            if (currentUsernames.includes(botName)) {
                i -= 1;
                continue;
            }

            dummySockets[i] = new SimpleBotSocket(botName);
            room.playerJoinRoom(dummySockets[i]);
            room.playerSitDown(dummySockets[i]);

            // Save a copy of the sockets within botSockets
            if (!room.botSockets) {
                room.botSockets = [];
            }
            room.botSockets.push(dummySockets[i]);
        }
    },
};
