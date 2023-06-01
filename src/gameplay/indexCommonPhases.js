// This file helps us load in the roles from the folder
import fs from 'fs';
import path from 'path';

function index() {
  // Import all the roles from AVALON
  this.getPhases = function (thisRoom) {
    const normalizedPath = path.join(__dirname, './commonPhases');

    const commonPhases = {};
    const obj = {};

    fs.readdirSync(normalizedPath).forEach((file) => {
      // console.log(file);

      // If it is a javascript file, add it
      if ((file.includes('.js') === true || file.includes('.ts'))&& !file.includes('.map')) {
        name = file.replace(/\.(js|ts)$/, '');

        commonPhases[name] = require(`./commonPhases/${file}`).default;
      }
    });

    for (var name in commonPhases) {
      if (commonPhases.hasOwnProperty(name)) {
        // Initialise it
        obj[name] = new commonPhases[name](thisRoom);
      }
    }

    return obj;
  };
}

export default index;
