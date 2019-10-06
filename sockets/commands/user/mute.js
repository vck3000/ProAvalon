const User = require('../../../models/user');

module.exports = {
    command: 'mute',
    help: '/mute: Mute a player who is being annoying in chat/buzzing/slapping/licking/poking/tickling you.',
    run(globalState, data, senderSocket) {
        const { args } = data;

        if (!args[1]) return { message: 'Please specify the user to mute.', classStr: 'server-text' };
    
        User.findOne({ username: args[1] }).exec((err, foundUserToMute) => {
            if (err) {
                console.log(err);
                return;
            } if (!foundUserToMute) {
                senderSocket.emit('messageCommandReturnStr', { message: `${args[1]} was not found.`, classStr: 'server-text' });
                return;
            }
            User.findOne({ username: senderSocket.request.user.username }).exec((err, userCallingMute) => {
                if (err) { console.log(err); } else if (userCallingMute) {
                    if (!userCallingMute.mutedPlayers) {
                        userCallingMute.mutedPlayers = [];
                    }
                    if (userCallingMute.mutedPlayers.indexOf(foundUserToMute.username) === -1) {
                        userCallingMute.mutedPlayers.push(foundUserToMute.username);
                        userCallingMute.markModified('mutedPlayers');
                        userCallingMute.save();
                        senderSocket.emit('updateMutedPlayers', userCallingMute.mutedPlayers);
                        senderSocket.emit('messageCommandReturnStr', { message: `Muted ${args[1]} successfully.`, classStr: 'server-text' });
                    } else {
                        senderSocket.emit('messageCommandReturnStr', { message: `You have already muted ${args[1]}.`, classStr: 'server-text' });
                    }
                }
            });
        });
    },
};
