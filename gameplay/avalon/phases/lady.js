/* Each phase should have:
    - Name
    - Whether to show guns or not
    - GameMove to perform operations
    - Buttons that are visible and what text they have
    - Number of targets allowed to be selected
    - Status message to display
    - Prohibited Indexes to pick (an array)
*/

var usernamesIndexes = require("../../../myFunctions/usernamesIndexes");

function Lady(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.phase = "lady";
    this.showGuns = false;

    this.card = "Lady of the Lake";
};

Lady.prototype.gameMove = function(socket, data){        
    if(socket === undefined || data === undefined){
        return;
    }

    console.log("typeof Data: ");
    console.log(typeof(data));

    if(typeof(data) === "object" || typeof(data) === "array"){
        data = data[0];
    }

    console.log("Data: ");
    console.log(data);

    //Check that the target's username exists
    var targetUsername = data;
    var found = false;
    for(var i = 0; i < this.thisRoom.playersInGame.length; i++){
        if(this.thisRoom.playersInGame[i].username === targetUsername){
            found = true;
            break;
        }
    }
    if(found === false){
        socket.emit("danger-alert", "Error: User does not exist. Tell the admin if you see this.");      
        return;
    }
    
    var indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;
    var ladyHistory = this.thisRoom.specialCards[this.card.toLowerCase()].ladyHistory;
    var targetIndex = usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, data);

    //Get index of socket 
    var indexOfSocket = undefined;
    for(var i = 0; i < this.thisRoom.playersInGame.length; i++){
        console.log("Comparing: " + this.thisRoom.playersInGame[i].username + " with " + socket.request.user.username);
        if(this.thisRoom.playersInGame[i].username === socket.request.user.username){
            indexOfSocket = i;
            break;
        }
    }

    console.log("Index of socket: ");
    console.log(indexOfSocket);

    // If the requester is the lady holder, do the lady stuff
    if(indexOfCardHolder === indexOfSocket){
        // Check if we can card that person
        if(ladyHistory.includes(data) === true){
            socket.emit("danger-alert", "You cannot card that person.");      
            return;
        }

        //grab the target's alliance
        var alliance = this.thisRoom.playersInGame[targetIndex].alliance;

        //emit to the lady holder the person's alliance
        socket.emit("lady-info", /*"Player " + */targetUsername + " is a " + alliance + ".");
        // console.log("Player " + target + " is a " + alliance);

        //update lady location
        this.thisRoom.specialCards[this.card.toLowerCase()].setHolder(targetIndex);

        // this.gameplayMessage = (socket.request.user.username + " has carded " + target);
        this.thisRoom.sendText(this.thisRoom.allSockets, (socket.request.user.username + " has carded " + targetUsername + "."), "gameplay-text");


        //update phase
        this.thisRoom.phase = "pickingTeam";
    }
    // The requester is not the lady holder. Ignore the request.
    else{
        socket.emit("danger-alert", "You do not hold the card.");      

        return;
    }

};

Lady.prototype.buttonSettings = function(indexOfPlayer){
    //Get the index of the lady
    var indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;

    var obj = {
        green: {},
        red: {}
    };

    if(indexOfPlayer === indexOfCardHolder){
        obj.green.hidden = false;
        obj.green.disabled = true;
        obj.green.setText = "Card";

        obj.red.hidden = true;
        obj.red.disabled = true;
        obj.red.setText = "";
    }
    // If it is any other player who isn't special role
    else{
        obj.green.hidden = true;
        obj.green.disabled = true;
        obj.green.setText = "";

        obj.red.hidden = true;
        obj.red.disabled = true;
        obj.red.setText = "";
    }
    return obj;
}

Lady.prototype.numOfTargets = function(indexOfPlayer){    
    var indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;

    if(indexOfPlayer !== undefined && indexOfPlayer !== null){
        // If indexOfPlayer is the lady holder, one player to select 
        if(indexOfPlayer === indexOfCardHolder){
            return 1;
        }
        else{
            return null;
        }
    }
}


Lady.prototype.getStatusMessage = function(indexOfPlayer){  
    var indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;

    if(indexOfPlayer === indexOfCardHolder){
        return "Choose a player to use the Lady of the Lake on.";
    }
    // If it is any other player who isn't special role
    else{
        var usernameOfCardHolder = this.thisRoom.playersInGame[indexOfCardHolder].username;
        return "Waiting for " + usernameOfCardHolder + " to use the Lady of the Lake on someone."
    }
}

Lady.prototype.getProhibitedIndexesToPick = function(indexOfPlayer){  
    var ladyHistory = this.thisRoom.specialCards[this.card.toLowerCase()].ladyHistory;

    return ladyHistory;
}





module.exports = Lady;

