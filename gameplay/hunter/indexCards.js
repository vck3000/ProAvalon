// This file helps us load in the roles from the folder

function index() {
    // Import all the roles from AVALON
    this.getCards = function (thisRoom) {
        const normalizedPath = require('path').join(__dirname, './cards');

        const cardImports = {};
        const obj = {};

        require('fs').readdirSync(normalizedPath).forEach((file) => {
            // console.log(file);

            if (file.includes('.js') === true) {
                name = file.replace('.js', '');

                cardImports[name] = require(`./cards/${file}`);
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
}

module.exports = index;
