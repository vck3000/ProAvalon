
module.exports = {
    command: 'help',
    help: '/help: ...shows help',
    run(data) {
    // do stuff

        const dataToReturn = [];
        let i = 0;

        i++;

        for (const key in actionsObj.userCommands) {
            if (actionsObj.userCommands.hasOwnProperty(key)) {
                if (!actionsObj.userCommands[key].modsOnly) {
                    dataToReturn[i] = { message: actionsObj.userCommands[key].help, classStr: 'server-text', dateCreated: new Date() };
                    i++;
                }
            }
        }
        return dataToReturn;
    },
};
