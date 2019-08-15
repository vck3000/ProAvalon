// This file helps us load in the roles from the folder

function index() {
    // Import all the roles from AVALON
    this.getPhases = function (thisRoom) {
        const normalizedPath = require('path').join(__dirname, './phases');

        const phases = {};
        const obj = {};

        require('fs').readdirSync(normalizedPath).forEach((file) => {
            // console.log(file);

            // If it is a javascript file, add it
            if (file.includes('.js') === true) {
                // Trim .js at the end of the file name
                name = file.replace('.js', '');

                phases[name] = require(`./phases/${file}`);
            }
        });


        for (var name in phases) {
            if (phases.hasOwnProperty(name)) {
                // Initialise it
                obj[name] = new phases[name](thisRoom);
            }
        }

        return obj;
    };
}

module.exports = index;
