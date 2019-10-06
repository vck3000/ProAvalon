module.exports = {
    command: 'mtogglepause',
    help: '/mtogglepause : Pauses or unpauses the current room.',
    run(globalState, data, senderSocket) {
        const currentRoom = globalState.rooms[senderSocket.request.user.inRoomId];
        if (currentRoom) {
            // if unpaused, we pause
            // if not started or finished, no action
            if (!currentRoom.gameStarted) {
                return { message: 'Game has not started.', classStr: 'server-text' };
            }
            if (currentRoom.phase === 'finished') {
                return { message: 'Game has finished.', classStr: 'server-text' };
            }
            currentRoom.togglePause(senderSocket.request.user.username);
        } else {
            return { message: 'You are not in a room.', classStr: 'server-text' };
        }
    },
};
