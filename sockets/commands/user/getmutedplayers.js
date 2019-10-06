
module.exports = {
    command: 'getmutedplayers',
    help: '/getmutedplayers: See who you have muted.',
    run(data, senderSocket) {
        const { args } = data;

        if (args[1] === senderSocket.request.user.username) {
            senderSocket.emit('messageCommandReturnStr', { message: 'Why would you mute yourself...?', classStr: 'server-text' });
            return;
        }

        User.findOne({ username: senderSocket.request.user.username }).exec((err, foundUser) => {
            if (err) { console.log(err); } else if (foundUser) {
                if (!foundUser.mutedPlayers) {
                    foundUser.mutedPlayers = [];
                }

                const dataToReturn = [];
                dataToReturn[0] = { message: 'Muted players:', classStr: 'server-text' };

                for (let i = 0; i < foundUser.mutedPlayers.length; i++) {
                    dataToReturn[i + 1] = { message: `-${foundUser.mutedPlayers[i]}`, classStr: 'server-text' };
                }
                if (dataToReturn.length === 1) {
                    dataToReturn[0] = { message: 'You have no muted players.', classStr: 'server-text' };
                }

                // console.log(dataToReturn);

                senderSocket.emit('messageCommandReturnStr', dataToReturn);
            }
        });
    },
};
