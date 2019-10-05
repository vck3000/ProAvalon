
module.exports = {
    command: 'mannounce',
    help: '/mannounce <message>: Sends a sweet alert to all online players with an included message. It automatically says the username of the mod that executed the command.',
    run(data, senderSocket) {
        const { args } = data;
        if (!args[1]) {
            senderSocket.emit('messageCommandReturnStr', { message: 'Please enter a message...', classStr: 'server-text' });
            return;
        }

        let str = '';
        for (let i = 1; i < args.length; i++) {
            str += args[i];
            str += ' ';
        }

        str += `<br><br>From: ${senderSocket.request.user.username}`;

        allSockets.forEach((sock) => {
            sock.emit('mannounce', str);
        });
    },
};
