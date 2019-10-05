
module.exports = {
    command: 'munban',
    help: "/munban <player name>: Removes ALL existing bans OR mutes on a player's name.",
    async run(data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
            return { message: 'Specify a username.', classStr: 'server-text' };
        }

        modAction.find({ 'bannedPlayer.usernameLower': args[1].toLowerCase() }, (err, foundModAction) => {
            // console.log("foundmodaction");
            // console.log(foundModAction);
            if (foundModAction.length !== 0) {
                modAction.remove({ 'bannedPlayer.usernameLower': args[1].toLowerCase() }, (err, foundModAction) => {
                    if (err) {
                        console.log(err);
                        senderSocket.emit('messageCommandReturnStr', { message: 'Something went wrong.', classStr: 'server-text' });
                    } else {
                        // console.log("Successfully unbanned " + args[1] + ".");
                        senderSocket.emit('messageCommandReturnStr', { message: `Successfully unbanned ${args[1]}.`, classStr: 'server-text' });


                        reloadCurrentModActions();
                    }
                });
            } else {
                senderSocket.emit('messageCommandReturnStr', { message: `${args[1]} does not have a ban.`, classStr: 'server-text' });
            }
        });
    },
};
