
module.exports = {
    command: 'allchat',
    help: '/allchat: Get a copy of the last 5 minutes of allchat.',
    run(data, senderSocket) {
    // code
        const { args } = data;
        return allChat5Min;
    },
};
