// This file helps us load in the roles from the folder
import fs from 'fs';
import path from 'path';

function index() {
  // Import all the roles from AVALON
  this.getRoles = function (thisRoom) {
    const normalizedPath = path.join(__dirname, './roles');

    const roleImports = {};
    const obj = {};

    fs.readdirSync(normalizedPath).forEach((file) => {
      // console.log(file);

      // If it is a javascript file, add it
      if (file.includes('.js') === true && !file.includes('.map')) {
        name = file.replace('.js', '');

        roleImports[name] = require(`./roles/${file}`).default;
      }
    });

    for (var name in roleImports) {
      if (roleImports.hasOwnProperty(name)) {
        // Initialise it
        obj[name] = new roleImports[name](thisRoom);
      }
    }

    return obj;
  };
}

export default index;
