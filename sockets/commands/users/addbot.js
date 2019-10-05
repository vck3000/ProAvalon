
module.exports = {
    command: 'addbot',
    help: '/addbot <name> [number]: Run this in a bot-compatible room. Add a bot to the room.',
    run(data, senderSocket) {
        if (senderSocket.request.user.inRoomId === undefined || rooms[senderSocket.request.user.inRoomId] === undefined) {
            return {
                message: 'You must be in a bot-capable room to run this command!',
                classStr: 'server-text',
            };
        } if (rooms[senderSocket.request.user.inRoomId].gameMode.toLowerCase().includes('bot') === false) {
            return {
                message: 'This room is not bot capable. Please join a bot-capable room.',
                classStr: 'server-text',
            };
        } if (rooms[senderSocket.request.user.inRoomId].host !== senderSocket.request.user.username) {
            return {
                message: 'You are not the host.',
                classStr: 'server-text',
            };
        }

        const currentRoomId = senderSocket.request.user.inRoomId;
        const currentRoom = rooms[currentRoomId];

        if (currentRoom.gameStarted === true || currentRoom.canJoin === false) {
            return {
                message: 'No bots can join this room at this time.',
                classStr: 'server-text',
            };
        }

        const { args } = data;

        if (!args[1]) {
            return {
                message: 'Specify a bot. Use /getbots to see online bots.',
                classStr: 'server-text',
            };
        }
        var botName = args[1];
        const botAPI = enabledBots.find((bot) => bot.name.toLowerCase() === botName.toLowerCase());
        if (!botAPI && botName !== 'SimpleBot') {
            return {
                message: `Couldn't find a bot called ${botName}.`,
                classStr: 'server-text',
            };
        }

        const numBots = +args[2] || 1;

        if (currentRoom.socketsOfPlayers.length + numBots > currentRoom.maxNumPlayers) {
            return {
                message: `Adding ${numBots} bot(s) would make this room too full.`,
                classStr: 'server-text',
            };
        }

        const addedBots = [];
        for (let i = 0; i < numBots; i++) {
            var botName = `${botAPI.name}#${Math.floor(Math.random() * 100)}`;

            // Avoid a username clash!
            const currentUsernames = currentRoom.socketsOfPlayers.map((sock) => sock.request.user.username);
            if (currentUsernames.includes(botName)) {
                i--;
                continue;
            }

            var dummySocket;
            if (botAPI.name == 'SimpleBot') {
                dummySocket = new SimpleBotSocket(botName);
            } else {
                dummySocket = new APIBotSocket(botName, botAPI);
            }

            currentRoom.playerJoinRoom(dummySocket);
            currentRoom.playerSitDown(dummySocket);
            if (!currentRoom.botSockets) {
                currentRoom.botSockets = [];
            }
            currentRoom.botSockets.push(dummySocket);
            addedBots.push(botName);
        }

        if (addedBots.length > 0) {
            sendToRoomChat(ioGlobal, currentRoomId, {
                message: `${senderSocket.request.user.username} added bots to this room: ${addedBots.join(', ')}`,
                classStr: 'server-text-teal',
            });
        }
    },
};
