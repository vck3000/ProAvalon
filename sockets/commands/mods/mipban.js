
module.exports = {
    command: 'mipban',
    help: '/mipban <username>: Ban the IP of the player given. /munban does not undo this ban. Contact ProNub to remove an IP ban.',
    run(data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
            senderSocket.emit('messageCommandReturnStr', { message: 'Specify a username', classStr: 'server-text' });
            return { message: 'Specify a username.', classStr: 'server-text' };
        }

        User.find({ usernameLower: senderSocket.request.user.username.toLowerCase() }).populate('notifications').exec((err, foundUser) => {
            if (err) { console.log(err); } else if (foundUser) {
                const slapSocket = allSockets[getIndexFromUsername(allSockets, args[1], true)];
                if (slapSocket) {
                    const clientIpAddress = slapSocket.request.headers['x-forwarded-for'] || slapSocket.request.connection.remoteAddress;

                    const banIpData = {
                        type: 'ip',
                        bannedIp: clientIpAddress,
                        usernamesAssociated: [args[1].toLowerCase()],
                        modWhoBanned: { id: foundUser._id, username: foundUser.username },
                        whenMade: new Date(),
                    };

                    banIp.create(banIpData, (err, newBan) => {
                        if (err) { console.log(err); } else {
                            allSockets[getIndexFromUsername(allSockets, args[1].toLowerCase(), true)].disconnect(true);

                            senderSocket.emit('messageCommandReturnStr', { message: `Successfully ip banned user ${args[1]}`, classStr: 'server-text' });
                        }
                    });
                } else {
                    senderSocket.emit('messageCommandReturnStr', { message: 'Could not find the player to ban.', classStr: 'server-text' });
                }
            } else {
                // send error message back
                senderSocket.emit('messageCommandReturnStr', { message: "Could not find your user data (your own one, not the person you're trying to ban)", classStr: 'server-text' });
            }
        });
    },
};
