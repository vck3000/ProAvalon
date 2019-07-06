//This file helps us load in the roles from the folder

function index() {
    //Import all the roles from AVALON
    this.getCards = function (thisRoom) {
        var normalizedPath = require("path").join(__dirname, "./cards");

        var cardImports = {};
        var obj = {};

        require("fs").readdirSync(normalizedPath).forEach(function (file) {
            // console.log(file);

            if (file.includes(".js") === true) {
                name = file.replace(".js", "");

                cardImports[name] = require("./cards/" + file);
            }
        });


        for (var name in cardImports) {
            if (cardImports.hasOwnProperty(name)) {
                //Initialise it
                obj[name] = new cardImports[name](thisRoom);
            }
        }

        return obj;
    };
}

module.exports = index;


