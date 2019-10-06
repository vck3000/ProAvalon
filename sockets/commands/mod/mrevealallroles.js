
module.exports = {
    command: 'mrevealallroles',
    help: '/mrevealallroles : Reveals the roles of all players in the current room.',
    run(data, senderSocket) {
        const roomId = senderSocket.request.user.inRoomId;
        if (rooms[roomId]) {
            if (!rooms[roomId].gameStarted) {
                return { message: 'Game has not started.', classStr: 'server-text' };
            }
            rooms[roomId].sendText(rooms[roomId].allSockets, `Moderator ${senderSocket.request.user.username} has revealed all roles.`, 'server-text');

            // reveal role for each user
            rooms[roomId].playersInGame.forEach((user) => {
                senderSocket.emit('messageCommandReturnStr', { message: `${user.username}'s role is ${user.role.toUpperCase()}.`, classStr: 'server-text' });
            });
        } else {
            return { message: 'You are not in a room.', classStr: 'server-text' };
        }
    },
};
