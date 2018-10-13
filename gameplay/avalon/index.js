
//Import all the roles from AVALON

var normalizedPath = require("path").join(__dirname, "./roles");


var roleImports = {};
var obj = {};

require("fs").readdirSync(normalizedPath).forEach(function(file) {
    // console.log(file);

    name = file.replace(".js", "");

    roleImports[name] = require("./roles/" + file);
});


for(var name in roleImports){
    if(roleImports.hasOwnProperty(name)){
        //Initialise it
        obj[name] = new roleImports[name];
    }
}


module.exports = obj;