
module.exports = {
    command: 'mclose',
    help: '/mclose <roomId> [<roomId> <roomId> ...]: Close room <roomId>. Also removes the corresponding save files in the database. Can take multiple room IDs.',
    run(globalState, data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
            senderSocket.emit('messageCommandReturnStr', { message: 'Specify a number.', classStr: 'server-text' });
            return;
        }

        const roomIdsToClose = args.splice(1);
        // console.log(roomIdsToClose);

        roomIdsToClose.forEach((idToClose) => {
            if (globalState.rooms[idToClose] !== undefined) {
                // Disconnect everyone
                for (let i = 0; i < globalState.rooms[idToClose].globalState.allSockets.length; i++) {
                    globalState.rooms[idToClose].globalState.allSockets[i].emit('leave-room-requested');
                }

                // Stop bots thread if they are playing:
                if (globalState.rooms[idToClose].interval) {
                    clearInterval(globalState.rooms[idToClose].interval);
                    globalState.rooms[idToClose].interval = undefined;
                }

                // Forcefully close room
                if (globalState.rooms[idToClose]) {
                    destroyRoom(globalState.rooms[idToClose].roomId);
                }
                senderSocket.emit('messageCommandReturnStr', { message: `Closed room ${idToClose}.`, classStr: 'server-text' });
            } else {
                senderSocket.emit('messageCommandReturnStr', { message: `Could not close room ${idToClose}.`, classStr: 'server-text' });
            }
        });

        updateCurrentGamesList();
    },
};
