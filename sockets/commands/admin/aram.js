
module.exports = {
    command: 'aram',
    help: '/aram: get the ram used',
    run() {
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        return { message: `The script uses approximately ${Math.round(used * 100) / 100} MB`, classStr: 'server-text' };
    },
};
