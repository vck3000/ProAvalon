
module.exports = {
    command: 'maddbots',
    help: '/maddbots <number>: Add <number> bots to the room.',
    run(globalState, data, senderSocket, roomIdInput) {
        const { args } = data;

        if (!args[1]) {
            senderSocket.emit('messageCommandReturnStr', { message: 'Specify a number.', classStr: 'server-text' });
            return;
        }

        let roomId;
        if (senderSocket === undefined) {
            roomId = roomIdInput;
        } else {
            roomId = senderSocket.request.user.inRoomId;
        }

        if (globalState.rooms[roomId]) {
            const dummySockets = [];

            for (let i = 0; i < args[1]; i++) {
                const botName = `${'SimpleBot' + '#'}${Math.floor(Math.random() * 100)}`;

                // Avoid a username clash!
                const currentUsernames = globalState.rooms[roomId].socketsOfPlayers.map((sock) => sock.request.user.username);
                if (currentUsernames.includes(botName)) {
                    i--;
                    continue;
                }

                dummySockets[i] = new SimpleBotSocket(botName);
                globalState.rooms[roomId].playerJoinRoom(dummySockets[i]);
                globalState.rooms[roomId].playerSitDown(dummySockets[i]);

                // Save a copy of the sockets within botSockets
                if (!globalState.rooms[roomId].botSockets) {
                    globalState.rooms[roomId].botSockets = [];
                }
                globalState.rooms[roomId].botSockets.push(dummySockets[i]);
            }
        }
    },
};
