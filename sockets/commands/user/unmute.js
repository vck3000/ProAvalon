
module.exports = {
    command: 'unmute',
    help: '/unmute: Unmute a player.',
    run(data, senderSocket) {
        const { args } = data;

        if (args[1]) {
            User.findOne({ username: senderSocket.request.user.username }).exec((err, foundUser) => {
                if (err) { console.log(err); } else if (foundUser) {
                    if (!foundUser.mutedPlayers) {
                        foundUser.mutedPlayers = [];
                    }
                    const index = foundUser.mutedPlayers.indexOf(args[1]);

                    if (index !== -1) {
                        foundUser.mutedPlayers.splice(index, 1);
                        foundUser.markModified('mutedPlayers');
                        foundUser.save();

                        senderSocket.emit('updateMutedPlayers', foundUser.mutedPlayers);
                        senderSocket.emit('messageCommandReturnStr', { message: `Unmuted ${args[1]} successfully.`, classStr: 'server-text' });
                    } else {
                        senderSocket.emit('messageCommandReturnStr', { message: `Could not find ${args[1]}.`, classStr: 'server-text' });
                    }
                }
            });
        } else {
            senderSocket.emit('messageCommandReturnStr', { message: `${args[1]} was not found or was not muted from the start.`, classStr: 'server-text' });
        }
    },
};
