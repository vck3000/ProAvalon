const GameRoom = require('../../../gameplay/game');
const { sendToAllChat, updateCurrentGamesList, socketCallback } = require('../../util');
const maddbots = require('./maddbots');

module.exports = {
    command: 'mtestgame',
    help: '/mtestgame <number>: Add <number> bots to a test game and start it automatically.',
    run(globalState, data, senderSocket, io) {
        const { args } = data;

        if (!args[1]) {
            senderSocket.emit('messageCommandReturnStr', { message: 'Specify a number.', classStr: 'server-text' });
            return;
        }

        if (parseInt(args[1], 10) > 10 || parseInt(args[1], 10) < 1) {
            senderSocket.emit('messageCommandReturnStr', { message: 'Specify a number between 1 and 10.', classStr: 'server-text' });
            return;
        }

        // Get the next room Id
        while (globalState.rooms[globalState.nextRoomId]) {
            globalState.nextRoomId += 1;
        }
        const dataObj = {
            maxNumPlayers: 10,
            newRoomPassword: '',
            gameMode: 'avalonBot',
        };


        // Create the room
        globalState.rooms[globalState.nextRoomId] = new GameRoom('Bot game', globalState.nextRoomId, io, dataObj.maxNumPlayers, dataObj.newRoomPassword, dataObj.gameMode, socketCallback);
        const privateStr = (dataObj.newRoomPassword === '') ? '' : 'private ';
        // broadcast to all chat
        const messageData = {
            message: `Bot game has created ${privateStr}room ${globalState.nextRoomId}.`,
            classStr: 'server-text',
        };
        sendToAllChat(globalState, messageData);

        // Add the bots to the room
        maddbots.run(globalState, data);

        // Start the game.
        const options = ['Merlin', 'Assassin', 'Percival', 'Morgana', 'Ref of the Rain', 'Sire of the Sea', 'Lady of the Lake'];
        globalState.rooms[globalState.nextRoomId].hostTryStartGame(options, 'avalonBot');

        updateCurrentGamesList();
    },
};
