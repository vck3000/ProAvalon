//This file helps us load in the roles from the folder

function index(){
    //Import all the roles from AVALON
    this.getRoles = function(thisRoom){
        var normalizedPath = require("path").join(__dirname, "./roles");

        var roleImports = {};
        var obj = {};
    
        require("fs").readdirSync(normalizedPath).forEach(function(file) {
            // console.log(file);
    
            // If it is a javascript file, add it
            if(file.includes(".js")){
                name = file.replace(".js", "");
        
                roleImports[name] = require("./roles/" + file);
            }
        });
    
    
        for(var name in roleImports){
            if(roleImports.hasOwnProperty(name)){
                //Initialise it
                obj[name] = new roleImports[name](thisRoom);
            }
        }

        return obj;
    };
}

module.exports = index;


