/* Each phase must have:
    - Name
    - Whether to show guns or not
    - GameMove to perform operations
    - Buttons that are visible and what text they have
    - Number of targets allowed to be selected
    - Status message to display
*/
var usernamesIndexes = require("../../myFunctions/usernamesIndexes");

function Finished(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.phase = "finished";
    this.showGuns = true;
};

Finished.prototype.gameMove = function(socket, data){        
    // Do nothing, game is finished.
};

// Returns a object with green and red keys. 
// Green and Red must both have the following properties:
//  hidden          - Is the button hidden?
//  disabled        - Is the button disabled?
//  setText         - What text to display in the button
Finished.prototype.buttonSettings = function(indexOfPlayer){  
    var obj = {
		green:{},
		red: {}
    };

    obj.green.hidden = true;
    obj.green.disabled = true;
    obj.green.setText = "";

    obj.red.hidden = true;
    obj.red.disabled = true;
    obj.red.setText = "";

    return obj;    
}

Finished.prototype.numOfTargets = function(indexOfPlayer){    
    return null;
}

Finished.prototype.getStatusMessage = function(indexOfPlayer){  
    var winningTeam;
    if(this.thisRoom.winner === "Spy"){
        winningTeam = "spies";
    }
    else if(this.thisRoom.winner === "Resistance"){
        winningTeam = "resistance";
    }
    else{
        winningTeam = "Error...";
    }

    var str = "Game has finished. The " + winningTeam + " have won.";
    return str;
}


module.exports = Finished;

