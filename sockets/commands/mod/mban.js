const modsArray = require('../../../modsadmins/mods');

module.exports = {
    command: 'mban',
    help: '/mban: Open the ban interface',
    run(globalState, data, senderSocket) {
        if (modsArray.indexOf(senderSocket.request.user.username.toLowerCase()) !== -1) {
            senderSocket.emit('openModModal');
            return { message: 'May your judgement bring peace to all!', classStr: 'server-text' };
        }

        // TODO: add a report to this player.
        return { message: 'You are not a mod. Why are you trying this...', classStr: 'server-text' };
    },
};
