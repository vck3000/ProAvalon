
module.exports = {
    command: 'aipban',
    help: '/aipban <ip>: Ban the IP of the IP given. /munban does not undo this ban. Contact ProNub to remove an IP ban.',
    run(globalState, data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
            senderSocket.emit('messageCommandReturnStr', { message: 'Specify an IP', classStr: 'server-text' });
            return { message: 'Specify a username.', classStr: 'server-text' };
        }

        User.find({ usernameLower: senderSocket.request.user.username.toLowerCase() }).populate('notifications').exec((err, foundUser) => {
            if (err) { console.log(err); } else if (foundUser) {
                const banIpData = {
                    type: 'ip',
                    bannedIp: args[1],
                    usernamesAssociated: [],
                    modWhoBanned: { id: foundUser._id, username: foundUser.username },
                    whenMade: new Date(),
                };

                banIp.create(banIpData, (err, newBan) => {
                    if (err) { console.log(err); } else {
                        senderSocket.emit('messageCommandReturnStr', { message: `Successfully banned ip ${args[1]}`, classStr: 'server-text' });
                    }
                });
            } else {
                // send error message back
                senderSocket.emit('messageCommandReturnStr', { message: "Could not find your user data (your own one, not the person you're trying to ban)", classStr: 'server-text' });
            }
        });
    },
};
