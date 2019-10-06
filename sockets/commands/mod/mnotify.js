const User = require('../../../models/user');
const createNotificationObj = require('../../../myFunctions/createNotification');

module.exports = {
    command: 'mnotify',
    help: '/mnotify <player name> <text to leave for player>: Leaves a message for a player that will appear in their notifications. Note your name will be added to the end of the message to them.',
    async run(globalState, data, senderSocket) {
        const { args } = data;
        let str = '';
        for (let i = 2; i < args.length; i += 1) {
            str += args[i];
            str += ' ';
        }

        str += (`(From: ${senderSocket.request.user.username})`);

        User.findOne({ usernameLower: args[1].toLowerCase() }).exec((err, foundUser) => {
            if (err) {
                console.log(err);
                senderSocket.emit('messageCommandReturnStr', { message: 'Server error... let me know if you see this.', classStr: 'server-text' });
            } else if (foundUser) {
                const userIdTarget = foundUser._id;
                const stringToSay = str;
                const link = '#';

                createNotificationObj.createNotification(userIdTarget, stringToSay, link, senderSocket.request.user.username);
                senderSocket.emit('messageCommandReturnStr', { message: `Sent to ${foundUser.username} successfully! Here was your message: ${str}`, classStr: 'server-text' });
            } else {
                senderSocket.emit('messageCommandReturnStr', { message: `Could not find ${args[1]}`, classStr: 'server-text' });
            }
        });
    },
};
