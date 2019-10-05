
module.exports = {
    command: 'rembot',
    help: '/rembot (<name>|all): Run this in a bot-compatible room. Removes a bot from the room.',
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
        const { args } = data;

        if (currentRoom.gameStarted === true || currentRoom.canJoin === false) {
            return {
                message: 'No bots can be removed from this room at this time.',
                classStr: 'server-text',
            };
        }

        if (!args[1]) {
            return {
                message: 'Specify a bot to remove, or use "/rembot all" to remove all bots.',
                classStr: 'server-text',
            };
        }
        const botName = args[1];
        const botSockets = currentRoom.botSockets.slice() || [];
        const botsToRemove = (botName === 'all')
            ? botSockets
            : botSockets.filter((socket) => socket.request.user.username.toLowerCase() === botName.toLowerCase());
        if (botsToRemove.length === 0) {
            return {
                message: "Couldn't find any bots with that name to remove.",
                classStr: 'server-text',
            };
        }

        botsToRemove.forEach((botSocket) => {
            currentRoom.playerLeaveRoom(botSocket);

            if (currentRoom.botSockets && currentRoom.botSockets.indexOf(botSocket) !== -1) {
                currentRoom.botSockets.splice(currentRoom.botSockets.indexOf(botSocket), 1);
            }
        });

        const removedBots = botsToRemove.map((botSocket) => botSocket.request.user.username);
        sendToRoomChat(ioGlobal, currentRoomId, {
            message: `${senderSocket.request.user.username} removed bots from this room: ${removedBots.join(', ')}`,
            classStr: 'server-text-teal',
        });
    },
};
