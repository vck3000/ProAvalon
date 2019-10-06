const fs = require('fs');

const gameModeNames = fs.readdirSync(__dirname).filter((file) => fs.statSync(`${__dirname}/${file}`).isDirectory() && file !== 'commonPhases');

module.exports = gameModeNames;
