const { adminCommands } = require('../index');

module.exports = {
    command: 'a',
    help: '/a: ...shows mods commands',
    run() {
        const dataToReturn = Object.keys(adminCommands)
            .filter((key) => !adminCommands[key].modsOnly)
            .map((key) => ({ message: adminCommands[key].help, classStr: 'server-text' }));

        return dataToReturn;
    },
};
