
module.exports = {
    command: 'mremovefrozen',
    help: '/mremovefrozen: Remove all frozen globalState.rooms and the corresponding save files in the database.',
    run(globalState, data, senderSocket) {
        for (let i = 0; i < globalState.rooms.length; i++) {
            if (globalState.rooms[i] && globalState.rooms[i].frozen === true) {
                destroyRoom(globalState.rooms[i].roomId);
            }
        }
        updateCurrentGamesList();
    },
};
