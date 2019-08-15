// This file helps us load in the rewards from the folder

class index {
    // Import all the rewards
    getAllRewards(thisRoom) {
        const normalizedPath = require('path').join(__dirname, './allRewards');

        const allRewards = {};

        require('fs').readdirSync(normalizedPath).forEach((file) => {
            // console.log(file);

            // If it is a javascript file, add it
            if (file.includes('.js') === true) {
                // Trim .js at the end of the file name
                const name = file.replace('.js', '');

                allRewards[name] = require(`./allRewards/${file}`);
            }
        });

        return allRewards;
    }
}

module.exports = index;
