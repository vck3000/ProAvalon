const { destroyRoom, updateCurrentGamesList } = require('../../util');

module.exports = {
    command: 'mremovefrozen',
    help: '/mremovefrozen: Remove all frozen globalState.rooms and the corresponding save files in the database.',
    run(globalState) {
        for (let i = 0; i < globalState.rooms.length; i += 1) {
            if (globalState.rooms[i] && globalState.rooms[i].frozen) {
                destroyRoom(globalState.rooms[i].roomId);
            }
        }
        updateCurrentGamesList();
    },
};
