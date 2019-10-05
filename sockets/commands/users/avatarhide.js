
module.exports = {
    command: 'avatarhide',
    help: '/avatarhide: Hide your custom avatar.',
    run(data, senderSocket) {
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
