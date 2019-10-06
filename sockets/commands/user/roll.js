
module.exports = {
    command: 'roll',
    help: '/roll <optional number>: Returns a random number between 1 and 10 or 1 and optional number.',
    run(globalState, data, senderSocket) {
        const { args } = data;

        // code
        if (args[1]) {
            if (isNaN(args[1]) === false) {
                return { message: (Math.floor(Math.random() * args[1]) + 1).toString(), classStr: 'server-text' };
            }

            return { message: 'That is not a valid number!', classStr: 'server-text' };
        }
        return { message: (Math.floor(Math.random() * 10) + 1).toString(), classStr: 'server-text' };
    },
};
