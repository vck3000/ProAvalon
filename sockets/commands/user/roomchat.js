
module.exports = {
    command: 'roomchat',
    help: '/roomchat: Get a copy of the chat for the current game.',
    run(globalState, data, senderSocket) {
        const room = globalState.rooms[senderSocket.request.user.inRoomId] || {};
        if (room.gameStarted) {
            return globalState.rooms[senderSocket.request.user.inRoomId].chatHistory;
        }

        return { message: "The game hasn't started yet. There is no chat to display.", classStr: 'server-text' };
    },
};
