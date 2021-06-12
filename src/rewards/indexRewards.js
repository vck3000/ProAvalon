// This file helps us load in the rewards from the folder
import fs from 'fs';
import path from 'path';

class index {
  // Import all the rewards
  getAllRewards(thisRoom) {
    const normalizedPath = path.join(__dirname, './allRewards');

    const allRewards = {};

    fs.readdirSync(normalizedPath).forEach((file) => {
      // console.log(file);

      // If it is a javascript file, add it
      if (file.includes('.js') === true && !file.includes('.map')) {
        // Trim .js at the end of the file name
        const name = file.replace('.js', '');

        allRewards[name] = require(`./allRewards/${file}`).default;
      }
    });

    return allRewards;
  }
}

export default index;
