
module.exports = {
    command: 'a',
    help: '/a: ...shows mods commands',
    run() {
        // do stuff
        const dataToReturn = [];
        let i = 1;

        for (const key in actionsObj.adminCommands) {
            if (actionsObj.adminCommands.hasOwnProperty(key)) {
                if (!actionsObj.adminCommands[key].modsOnly) {
                    dataToReturn[i] = { message: actionsObj.adminCommands[key].help, classStr: 'server-text' };
                    i++;
                }
            }
        }
        return dataToReturn;
    },
};
