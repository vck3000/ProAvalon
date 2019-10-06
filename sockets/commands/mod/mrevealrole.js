
module.exports = {
    command: 'mrevealrole',
    help: '/mrevealrole <username>: Reveal the role of a player. You must be present in the room for this to work.',
    run(globalState, data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
            senderSocket.emit('messageCommandReturnStr', { message: 'Specify a username.', classStr: 'server-text' });
            return;
        }

        const roomId = senderSocket.request.user.inRoomId;
        if (globalState.rooms[roomId]) {
            const user = globalState.rooms[roomId].playersInGame[getIndexFromUsername(globalState.rooms[roomId].playersInGame, args[1], true)];
            if (!globalState.rooms[roomId].gameStarted) {
                return { message: 'Game has not started.', classStr: 'server-text' };
            }
            if (!user) {
                return { message: `Could not find ${args[1]}.`, classStr: 'server-text' };
            }
            globalState.rooms[roomId].sendText(globalState.rooms[roomId].globalState.allSockets, `Moderator ${senderSocket.request.user.username} has revealed the role of ${user.username}.`, 'server-text');
            return { message: `${user.username}'s role is ${user.role.toUpperCase()}.`, classStr: 'server-text' };
        }

        return { message: `Could not find ${args[1]}, or you are not in a room.`, classStr: 'server-text' };
    },
};
