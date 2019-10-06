const savedGameObj = require('../models/savedGame');

exports.sendToRoomChat = (globalState, roomId, data) => {
    globalState.io.in(roomId).emit('roomChatToClient', data);
    if (globalState.rooms[roomId]) {
        globalState.rooms[roomId].addToChatHistory(data);
    }
};

exports.getIndexFromUsername = (sockets, username, caseInsensitive) => {
    if (!sockets || !username) return;

    for (let i = 0; i < sockets.length; i += 1) {
        if (caseInsensitive) {
            if (sockets[i].request.user.username.toLowerCase() === username.toLowerCase()) {
                return i;
            }
        } else if (sockets[i].request.user.username === username) {
            return i;
        }
    }
};

function deleteSaveGameFromDb(room) {
    savedGameObj.findByIdAndRemove(room.savedGameRecordId, (err) => {
        if (err) console.log(err);
    });
}
exports.deleteSaveGameFromDb = deleteSaveGameFromDb;

exports.destroyRoom = (globalState, roomId) => {
    const room = globalState.rooms[roomId];

    deleteSaveGameFromDb(room);

    // Stop bots thread if they are playing:
    if (room.interval) {
        clearInterval(room.interval);
        room.interval = undefined;
    }
    const thisGame = room;
    room.socketsOfPlayers.filter((socket) => socket.isBotSocket).forEach((botSocket) => {
        botSocket.handleGameOver(thisGame, 'complete', () => { }); // This room is getting destroyed. No need to leave.
    });

    delete globalState.rooms[roomId];
};


function sendToAllChat(globalState, data) {
    const date = new Date();
    data.dateCreated = date;

    globalState.allSockets.forEach((sock) => {
        sock.emit('allChatToClient', data);
    });

    globalState.allChatHistory.push(data);
    globalState.allChat5Min.push(data);

    let i = 0;

    // Five minutes in milliseconds
    while (date - globalState.allChat5Min[i].dateCreated > 1000 * 60 * 5) {
        if (i >= globalState.allChat5Min.length) {
            break;
        }
        i += 1;
    }

    if (i !== 0) {
        globalState.allChat5Min.splice(0, i);
    }
}
exports.sendToAllChat = sendToAllChat;

exports.socketCallback = (globalState, action, room) => {
    if (action === 'finishGame') {
        const data = {
            message: `Room ${room.roomId} has finished!`,
            classStr: 'server-text-teal',
        };
        sendToAllChat(globalState, data);
    }
};
