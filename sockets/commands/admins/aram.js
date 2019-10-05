
module.exports = {
    command: 'aram',
    help: '/aram: get the ram used',
    run(data) {
        const { args } = data;

        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        // console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);

        return { message: `The script uses approximately ${Math.round(used * 100) / 100} MB`, classStr: 'server-text' };
    },
};
