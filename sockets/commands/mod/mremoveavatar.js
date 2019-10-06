const User = require('../../../models/user');

module.exports = {
    command: 'mremoveavatar',
    help: "/mremoveavatar <player name>: Remove <player name>'s avatar.",
    async run(globalState, data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
            senderSocket.emit('messageCommandReturnStr', { message: 'Specify a username.', classStr: 'server-text' });
            return;
        }

        User.findOne({ usernameLower: args[1].toLowerCase() }).populate('notifications').exec((err, foundUser) => {
            if (err) { console.log(err); } else if (foundUser !== undefined) {
                foundUser.avatarImgRes = '';
                foundUser.avatarImgSpy = '';
                foundUser.save();

                senderSocket.emit('messageCommandReturnStr', { message: `Successfully removed ${args[1]}'s avatar.`, classStr: 'server-text' });
            } else {
                senderSocket.emit('messageCommandReturnStr', { message: `Could not find ${args[1]}'s avatar. If you think this is a problem, contact admin.`, classStr: 'server-text' });
            }
        });
    },
};
