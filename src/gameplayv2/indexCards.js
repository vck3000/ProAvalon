// This file helps us load in the roles from the folder
import fs from 'fs';
import path from 'path';

export const getCards = function (thisRoom) {
  const normalizedPath = path.join(__dirname, './cards');

  const cardImports = {};
  const obj = {};

  fs.readdirSync(normalizedPath).forEach((file) => {
    // console.log(file);

    if (file.includes('.js') === true && !file.includes('.map')) {
      name = file.replace('.js', '');

      cardImports[name] = require(`./cards/${file}`).default;
    }
  });

  for (var name in cardImports) {
    if (cardImports.hasOwnProperty(name)) {
      // Initialise it
      obj[name] = new cardImports[name](thisRoom);
    }
  }

  return obj;
};
