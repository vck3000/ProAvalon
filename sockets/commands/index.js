/* eslint-disable global-require, import/no-dynamic-require */
const fs = require('fs');

const commands = {
    userCommands: {},
    modCommands: {},
    adminCommands: {},
};

const getCommands = (name) => fs.readdirSync(`./${name}`)
    .filter((filename) => filename.endsWith('.js'))
    .forEach((filename) => {
        commands[`${name}Commands`][filename.slice(0, -3)] = require(`./${name}/${filename}`);
    });

['user', 'mod', 'admin'].forEach(getCommands);

module.exports = commands;
