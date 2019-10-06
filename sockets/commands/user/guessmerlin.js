
module.exports = {
    command: 'guessmerlin',
    help: '/guessmerlin <playername>: Solely for fun, submit your guess of who you think is Merlin.',
    run(globalState, data, senderSocket) {
        // Check the guesser is at a table
        const room = globalState.rooms[senderSocket.request.user.inRoomId] || {};
        const message = (senderSocket.request.user.inRoomId === undefined
            || room.gameStarted !== true
            || room.phase === 'finished')
            ? 'You must be at a running table to guess Merlin.'
            : room.submitMerlinGuess(senderSocket.request.user.username, data.args[1]);

        return { message, classStr: 'server-text noselect' };
    },
};
