const { getPlayerUsernamesFromAllSockets } = require('../../util');
const modsArray = require('../../../modsadmins/mods');

module.exports = {
    command: 'mods',
    help: '/mods: Shows a list of online moderators.',
    run(globalState) {
        const modUsers = getPlayerUsernamesFromAllSockets(globalState).filter((username) => modsArray.includes(username.toLowerCase()));
        const message = `Currently online mods: ${modUsers.length > 0 ? modUsers.join(', ') : 'None'}.`;
        return { message, classStr: 'server-text' };
    },
};
