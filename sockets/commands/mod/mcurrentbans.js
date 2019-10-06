
module.exports = {
    command: 'mcurrentbans',
    help: '/mcurrentbans: Show a list of currently active bans.',
    run(globalState, data, senderSocket) {
        const { args } = data;
        // do stuff
        const dataToReturn = [];
        let i = 0;
        i++;

        // Cutoff so we dont return perma bans (that are 1000 years long)
        cutOffDate = new Date('2999-12-17T03:24:00');
        modAction.find({
            $or: [
                { type: 'mute' },
                { type: 'ban' },
            ],
            $and: [
                { whenRelease: { $lte: cutOffDate } },
                { whenRelease: { $gte: new Date() } },
            ],
        }, (err, foundModActions) => {
            foundModActions.forEach((modActionFound) => {
                let message = '';
                if (modActionFound.type === 'ban') {
                    message = `${modActionFound.bannedPlayer.username} was banned for ${modActionFound.reason} by ${modActionFound.modWhoBanned.username}, description: '${modActionFound.descriptionByMod}' until: ${modActionFound.whenRelease.toString()}`;
                } else if (modActionFound.type === 'mute') {
                    message = `${modActionFound.bannedPlayer.username} was muted for ${modActionFound.reason} by ${modActionFound.modWhoBanned.username}, description: '${modActionFound.descriptionByMod}' until: ${modActionFound.whenRelease.toString()}`;
                }

                dataToReturn[dataToReturn.length] = { message, classStr: 'server-text' };
            });

            if (dataToReturn.length === 0) {
                senderSocket.emit('messageCommandReturnStr', { message: 'No one is banned! Yay!', classStr: 'server-text' });
            } else {
                senderSocket.emit('messageCommandReturnStr', dataToReturn);
            }
        });
    },
};
