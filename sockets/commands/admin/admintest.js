
module.exports = {
    command: 'admintest',
    help: '/admintest: Testing that only the admin can access this command',
    run(globalState, data) {
        const { args } = data;
        // do stuff
        return { message: 'admintest has been run.', classStr: 'server-text' };
    },
};
