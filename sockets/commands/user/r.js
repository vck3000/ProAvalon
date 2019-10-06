
module.exports = {
    command: 'r',
    help: '/r: Reply to a mod who just messaged you.',
    run(globalState, data, senderSocket) {
        const { args } = data;
        let str = `${senderSocket.request.user.username}->${lastWhisperObj[senderSocket.request.user.username]} (whisper): `;
        for (let i = 1; i < args.length; i++) {
            str += args[i];
            str += ' ';
        }

        // str += ("(From: " + senderSocket.request.user.username + ")");

        const dataMessage = {
            message: str,
            dateCreated: new Date(),
            classStr: 'whisper',
        };

        // this sendToSocket is the moderator
        const sendToSocket = globalState.allSockets[getIndexFromUsername(globalState.allSockets, lastWhisperObj[senderSocket.request.user.username], true)];

        if (!sendToSocket) {
            senderSocket.emit('messageCommandReturnStr', { message: "You haven't been whispered to before.", classStr: 'server-text' });
        } else {
            sendToSocket.emit('allChatToClient', dataMessage);
            sendToSocket.emit('roomChatToClient', dataMessage);

            // set the last whisper person
            lastWhisperObj[sendToSocket.request.user.username] = senderSocket.request.user.username;

            lastWhisperObj[senderSocket.request.user.username] = sendToSocket.request.user.username;

            senderSocket.emit('allChatToClient', dataMessage);
            senderSocket.emit('roomChatToClient', dataMessage);
        }
    },
};
