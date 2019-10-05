
module.exports = {
    command: 'a',
    help: '/a: ...shows mods commands',
    run(data) {
        const { args } = data;
        // do stuff
        const dataToReturn = [];
        let i = 0;
        i++;

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
