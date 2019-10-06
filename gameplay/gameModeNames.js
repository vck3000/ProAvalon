const fs = require('fs');

const gameModeNames = fs.readdirSync('.').filter((file) => fs.statSync(`${'./'}${file}`).isDirectory() && file !== 'commonPhases');

module.exports = gameModeNames;
