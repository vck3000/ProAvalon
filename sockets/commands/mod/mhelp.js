
module.exports = {
    command: 'mhelp',
    help: '/mhelp: show commands.',
    run(globalState, data, senderSocket) {
        const { args } = data;
        // do stuff
        const dataToReturn = [];
        let i = 0;
        i++;

        for (const key in actionsObj.modCommands) {
            if (actionsObj.modCommands.hasOwnProperty(key)) {
                if (!actionsObj.modCommands[key].modsOnly) {
                    // console.log(key + " -> " + p[key]);
                    dataToReturn[i] = { message: actionsObj.modCommands[key].help, classStr: 'server-text' };
                    // str[i] = userCommands[key].help;
                    i++;
                    // create a break in the chat
                    // data[i] = {message: "-------------------------", classStr: "server-text"};
                    // i++;
                }
            }
        }
        return dataToReturn;
    },
};
