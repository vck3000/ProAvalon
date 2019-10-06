
module.exports = {
    command: 'avatarshow',
    help: '/avatarshow: Show your custom avatar!',
    run(globalState, data, senderSocket) {
        User.findOne({ usernameLower: senderSocket.request.user.username.toLowerCase() }).populate('notifications').exec((err, foundUser) => {
            foundUser.avatarHide = false;
            foundUser.save();

            const dataToReturn = {
                message: 'Successfully unhidden.',
                classStr: 'server-text',
            };

            senderSocket.emit('messageCommandReturnStr', dataToReturn);
        });
    },
};
