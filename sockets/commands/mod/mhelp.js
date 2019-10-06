const fs = require('fs');

const helpStrs = fs.readdirSync('.')
    .filter((fname) => fname.endsWith('.js'))
    // eslint-disable-next-line global-require, import/no-dynamic-require
    .map((fname) => ({ message: require(`./${fname}`).help, classStr: 'server-text' }));

module.exports = {
    command: 'mhelp',
    help: '/mhelp: show commands.',
    run() {
        return helpStrs;
    },
};
