
module.exports = {
    command: 'mwhisper',
    help: '/mwhisper <player name> <text to send>: Sends a whisper to a player.',
    async run(data, senderSocket) {
        const { args } = data;
        let str = `${senderSocket.request.user.username}->${args[1]} (whisper): `;
        for (let i = 2; i < args.length; i++) {
            str += args[i];
            str += ' ';
        }

        // str += ("(From: " + senderSocket.request.user.username + ")");

        const dataMessage = {
            message: str,
            dateCreated: new Date(),
            classStr: 'whisper',
        };

        const sendToSocket = allSockets[getIndexFromUsername(allSockets, args[1], true)];

        if (!sendToSocket) {
            senderSocket.emit('messageCommandReturnStr', { message: `Could not find ${args[1]}`, classStr: 'server-text' });
        } else {
            // send notification that you can do /r for first whisper message
            if (!lastWhisperObj[sendToSocket.request.user.username]) {
                sendToSocket.emit('allChatToClient', { message: 'You can do /r <message> to reply.', classStr: 'whisper', dateCreated: new Date() });
                sendToSocket.emit('roomChatToClient', { message: 'You can do /r <message> to reply.', classStr: 'whisper', dateCreated: new Date() });
            }

            sendToSocket.emit('allChatToClient', dataMessage);
            sendToSocket.emit('roomChatToClient', dataMessage);

            senderSocket.emit('allChatToClient', dataMessage);
            senderSocket.emit('roomChatToClient', dataMessage);

            // set the last whisper person
            lastWhisperObj[sendToSocket.request.user.username] = senderSocket.request.user.username;

            lastWhisperObj[senderSocket.request.user.username] = sendToSocket.request.user.username;
        }
    },
};
