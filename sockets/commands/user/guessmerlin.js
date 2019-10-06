
module.exports = {
    command: 'guessmerlin',
    help: '/guessmerlin <playername>: Solely for fun, submit your guess of who you think is Merlin.',
    run(globalState, data, senderSocket) {
    // Check the guesser is at a table
        if (senderSocket.request.user.inRoomId === undefined
      || globalState.rooms[senderSocket.request.user.inRoomId].gameStarted !== true
      || globalState.rooms[senderSocket.request.user.inRoomId].phase === 'finished') {
            messageToClient = 'You must be at a running table to guess Merlin.';
        } else {
            messageToClient = globalState.rooms[senderSocket.request.user.inRoomId].submitMerlinGuess(senderSocket.request.user.username, data.args[1]);
        }

        return { message: messageToClient, classStr: 'server-text noselect' };
    },
};
