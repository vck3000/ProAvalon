// This file helps us load in the roles from the folder

function index() {
    // Import all the roles from AVALON
    this.getRoles = function (thisRoom) {
        const normalizedPath = require("path").join(__dirname, "../avalon/roles");

        const roleImports = {};
        const obj = {};

        require("fs").readdirSync(normalizedPath).forEach((file) => {
            // console.log(file);

            // If it is a javascript file, add it
            if (file.includes(".js")) {
                name = file.replace(".js", "");

                roleImports[name] = require(`../avalon/roles/${file}`);
            }
        });


        for (const name in roleImports) {
            if (roleImports.hasOwnProperty(name)) {
                // Initialise it
                obj[name] = new roleImports[name](thisRoom);
            }
        }

        return obj;
    };
}

module.exports = index;
