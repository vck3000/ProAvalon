//This file helps us load in the roles from the folder

function index() {
    //Import all the roles from AVALON
    this.getPhases = function (thisRoom) {
        var normalizedPath = require("path").join(__dirname, "./commonPhases");

        var commonPhases = {};
        var obj = {};

        require("fs").readdirSync(normalizedPath).forEach(function (file) {
            // console.log(file);

            // If it is a javascript file, add it
            if (file.includes(".js") === true) {
                name = file.replace(".js", "");

                commonPhases[name] = require("./commonPhases/" + file);
            }
        });


        for (var name in commonPhases) {
            if (commonPhases.hasOwnProperty(name)) {
                //Initialise it
                obj[name] = new commonPhases[name](thisRoom);
            }
        }

        return obj;
    };
}

module.exports = index;


