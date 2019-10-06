
module.exports = {
    command: 'killS',
    help: '/killS: test kill',
    run(data) {
        const { args } = data;
        // do stuff
        process.exit(0);

        return { message: 'killS has been run.', classStr: 'server-text' };
    },
};
