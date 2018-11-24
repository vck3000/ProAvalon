/* Each phase must have:
    - Name
    - Whether to show guns or not
    - GameMove to perform operations
    - Buttons that are visible and what text they have
    - Number of targets allowed to be selected
    - Status message to display
*/
var usernamesIndexes = require("../../../myFunctions/usernamesIndexes");

function Assassination(thisRoom_) {
    this.thisRoom = thisRoom_;

    // The role that is the owner of this phase
    this.role = "Assassin";

    this.phase = "assassination";
    this.showGuns = true;

    this.finishedShot = false;
    
};

Assassination.prototype.gameMove = function(socket, data){        
    if(this.finishedShot === false){
        // Carry out the assassination move
        if(socket && data){
            if(typeof(data) === "object" || typeof(data) === "array"){
                data = data[0];
            }
            // Check that the person making this request is the assassin
            var indexOfRequester = usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, socket.request.user.username);
            if(this.thisRoom.playersInGame[indexOfRequester].role === this.role){
                var indexOfTarget = usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, data);

                // Check the alliance of the target. If they are spy, reject it and ask them to shoot a res.
                // Note: Allowed to shoot Oberon
                if(this.thisRoom.playersInGame[indexOfTarget].alliance === "Spy" && 
                    this.thisRoom.playersInGame[indexOfTarget].role !== "Oberon"){

                    socket.emit("danger-alert", "You are not allowed to shoot a known spy.");
                    return;
                }

                // Get merlin's username
                var merlinUsername = undefined;
                for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
                    if (this.thisRoom.playersInGame[i].role === "Merlin") {
                        merlinUsername = this.thisRoom.playersInGame[i].username;
                    }
                }

                //set the player shot in the assassin role object
			    this.thisRoom.avalonRoles["assassin"].playerShot = data;
                
                if(indexOfTarget !== -1){
                    if(this.thisRoom.playersInGame[indexOfTarget].role === "Merlin"){
                        this.thisRoom.winner = "Spy";
                        this.thisRoom.howWasWon = "Assassinated Merlin correctly.";

                        this.thisRoom.sendText(this.thisRoom.allSockets, "The assassin has shot " + merlinUsername + "! They were correct!", classStr="gameplay-text-red");
                        this.thisRoom.finishGame("Spy");
                    }
                    else {
                        this.thisRoom.winner = "Resistance";
                        this.thisRoom.howWasWon = "Mission successes and Merlin did not die.";

                        // console.log("THIS WAS RUN ONCE");
                        this.thisRoom.sendText(this.thisRoom.allSockets, "The assassin has shot " + data + "! " + data + " was not merlin, " + merlinUsername + " was!" , classStr="gameplay-text-blue");
                        this.thisRoom.finishGame("Resistance");
                    }

                    this.finishedShot = true;

                    //For gameRecord - get the role that was shot
                    for(var i = 0; i < this.thisRoom.playersInGame.length; i++){
                        if(this.thisRoom.playersInGame[i].username === data){
                            this.thisRoom.whoAssassinShot = this.thisRoom.playersInGame[i].role;
                            break;
                        }
                    }
                }
                else{
                    console.log(data);
                    socket.emit("danger-alert", "Bad assassination data. Tell the admin if you see this!");
                }
            }
        }
    }
};

// Returns a object with green and red keys. 
// Green and Red must both have the following properties:
//  hidden          - Is the button hidden?
//  disabled        - Is the button disabled?
//  setText         - What text to display in the button
Assassination.prototype.buttonSettings = function(indexOfPlayer){  
    //Get the index of the assassin
    var indexOfAssassin = -1;
    for(var i = 0; i < this.thisRoom.playersInGame.length; i++){
        if(this.thisRoom.playersInGame[i].role === this.role){
            indexOfAssassin = i;
            break;
        }
    }

    var obj = {
        green: {},
        red: {}
    };

    if(indexOfPlayer === indexOfAssassin){
        obj.green.hidden = false;
        obj.green.disabled = true;
        obj.green.setText = "Shoot";

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

Assassination.prototype.numOfTargets = function(indexOfPlayer){    
    if(indexOfPlayer !== undefined && indexOfPlayer !== null){
        // If assassin, one player to select (assassinate)
        if(this.thisRoom.playersInGame[indexOfPlayer].role === this.role){
            return 1;
        }
        else{
            return null;
        }
    }
}


Assassination.prototype.getStatusMessage = function(indexOfPlayer){  
    //Get the index of the assassin
    var indexOfAssassin = -1;
    for(var i = 0; i < this.thisRoom.playersInGame.length; i++){
        if(this.thisRoom.playersInGame[i].role === this.role){
            indexOfAssassin = i;
        }
    }

    var obj = {};

    if(indexOfPlayer === indexOfAssassin){
        return "Shoot Merlin..."
    }
    // If it is any other player who isn't special role
    else{
        var usernameOfAssassin = this.thisRoom.playersInGame[indexOfAssassin].username;
        return "Waiting for " + usernameOfAssassin + " to assassinate Merlin."
    }
}

Assassination.prototype.getProhibitedIndexesToPick = function(indexOfPlayer){  
    var spyIndexes = [];

    for(var i = 0; i < this.thisRoom.playersInGame.length; i++){
        if(this.thisRoom.playersInGame[i].alliance === "Spy" && this.thisRoom.playersInGame[i].role !== "Oberon"){
            spyIndexes.push(i);
        }
    }

    return spyIndexes;
}



module.exports = Assassination;

