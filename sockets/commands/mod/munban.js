const modAction = require('../../../models/modAction');

module.exports = {
    command: 'munban',
    help: "/munban <player name>: Removes ALL existing bans OR mutes on a player's name.",
    run(globalState, data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
            return { message: 'Specify a username.', classStr: 'server-text' };
        }

        modAction.find({ 'bannedPlayer.usernameLower': args[1].toLowerCase() }, (err, foundModAction) => {
            if (err) {
                console.log(err);
                senderSocket.emit('messageCommandReturnStr', { message: 'Something went wrong.', classStr: 'server-text' });
            }

            if (foundModAction.length !== 0) {
                modAction.remove({ 'bannedPlayer.usernameLower': args[1].toLowerCase() }, (e) => {
                    if (e) {
                        console.log(e);
                        senderSocket.emit('messageCommandReturnStr', { message: 'Something went wrong.', classStr: 'server-text' });
                        return;
                    }
                    senderSocket.emit('messageCommandReturnStr', { message: `Successfully unbanned ${args[1]}.`, classStr: 'server-text' });

                    // load up all the modActions that are not released yet
                    modAction.find({ whenRelease: { $gt: new Date() }, $or: [{ type: 'mute' }, { type: 'ban' }] }, (_, allModActions) => {
                        // reset globalState.currentModAtions
                        globalState.currentModAtions = [];
                        for (let i = 0; i < allModActions.length; i += 1) {
                            globalState.currentModAtions.push(allModActions[i]);
                        }
                    });
                });
            } else {
                senderSocket.emit('messageCommandReturnStr', { message: `${args[1]} does not have a ban.`, classStr: 'server-text' });
            }
        });
    },
};
