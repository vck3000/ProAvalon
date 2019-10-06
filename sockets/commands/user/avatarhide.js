const User = require('../../../models/user');

module.exports = {
    command: 'avatarhide',
    help: '/avatarhide: Hide your custom avatar.',
    run(globalState, data, senderSocket) {
        User.findOne({ usernameLower: senderSocket.request.user.username.toLowerCase() }).populate('notifications').exec((err, foundUser) => {
            foundUser.avatarHide = true;
            foundUser.save();

            const dataToReturn = {
                message: 'Successfully hidden.',
                classStr: 'server-text',
            };

            senderSocket.emit('messageCommandReturnStr', dataToReturn);
        });
    },
};
