
module.exports = {
    command: 'roomchat',
    help: '/roomchat: Get a copy of the chat for the current game.',
    run(data, senderSocket) {
        const { args } = data;
        // code
        if (rooms[senderSocket.request.user.inRoomId] && rooms[senderSocket.request.user.inRoomId].gameStarted === true) {
            return rooms[senderSocket.request.user.inRoomId].chatHistory;
        }

        return { message: "The game hasn't started yet. There is no chat to display.", classStr: 'server-text' };
    },
};
