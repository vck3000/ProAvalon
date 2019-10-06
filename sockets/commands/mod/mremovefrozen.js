
module.exports = {
    command: 'mremovefrozen',
    help: '/mremovefrozen: Remove all frozen rooms and the corresponding save files in the database.',
    run(data, senderSocket) {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i] && rooms[i].frozen === true) {
                destroyRoom(rooms[i].roomId);
            }
        }
        updateCurrentGamesList();
    },
};
