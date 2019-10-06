
exports.sendToRoomChat = (globalState, roomId, data) => {
    globalState.io.in(roomId).emit('roomChatToClient', data);
    if (globalState.rooms[roomId]) {
        globalState.rooms[roomId].addToChatHistory(data);
    }
};

exports.getIndexFromUsername(sockets, username, caseInsensitive) {
    if (sockets && username) {
        for (let i = 0; i < sockets.length; i++) {
            if (caseInsensitive) {
                if (sockets[i].request.user.username.toLowerCase() === username.toLowerCase()) {
                    return i;
                }
            } else if (sockets[i].request.user.username === username) {
                return i;
            }
        }
    }
    return undefined;
}
