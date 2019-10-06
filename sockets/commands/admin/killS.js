
module.exports = {
    command: 'killS',
    help: '/killS: test kill',
    run() {
        process.exit(0);
        return { message: 'killS has been run.', classStr: 'server-text' };
    },
};
