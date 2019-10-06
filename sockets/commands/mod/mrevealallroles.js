
module.exports = {
    command: 'mrevealallroles',
    help: '/mrevealallroles : Reveals the roles of all players in the current room.',
    run(globalState, data, senderSocket) {
        const room = globalState.rooms[senderSocket.request.user.inRoomId];

        if (room) {
            if (!room.gameStarted) {
                return { message: 'Game has not started.', classStr: 'server-text' };
            }
            room.sendText(room.allSockets, `Moderator ${senderSocket.request.user.username} has revealed all roles.`, 'server-text');

            // reveal role for each user
            room.playersInGame.forEach((user) => {
                senderSocket.emit('messageCommandReturnStr', { message: `${user.username}'s role is ${user.role.toUpperCase()}.`, classStr: 'server-text' });
            });
        } else {
            return { message: 'You are not in a room.', classStr: 'server-text' };
        }
    },
};
