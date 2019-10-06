module.exports = {
    command: 'allchat',
    help: '/allchat: Get a copy of the last 5 minutes of allchat.',
    run(globalState) {
        return globalState.allChat5Min;
    },
};
