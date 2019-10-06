const fs = require('fs');

const helpStrs = fs.readdirSync(__dirname)
    .filter((fname) => fname.endsWith('.js'))
    // eslint-disable-next-line global-require, import/no-dynamic-require
    .map((fname) => ({ message: require(`./${fname}`).help, classStr: 'server-text' }));

module.exports = {
    command: 'a',
    help: '/a: shows admin commands',
    run() {
        return helpStrs;
    },
};
