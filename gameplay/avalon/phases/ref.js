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

class Ref {
    constructor(thisRoom) {
        this.thisRoom = thisRoom;
        
        this.phase = "ref";
        this.showGuns = false;
        
        this.card = "Ref of the Rain";
    };
    
    gameMove (socket, buttonPressed, selectedPlayers) {
        if (buttonPressed !== "yes") {
            // this.thisRoom.sendText(this.thisRoom.allSockets, `Button pressed was ${buttonPressed}. Let admin know if you see this.`, "gameplay-text");
            return;
        }

        if (socket === undefined || selectedPlayers === undefined) {
            return;
        }
        
        // console.log("typeof Data: ");
        // console.log(typeof(data));
        
        if (typeof (selectedPlayers) === "object" || typeof (selectedPlayers) === "array") {
            selectedPlayers = selectedPlayers[0];
        }
        
        // console.log("Data: ");
        // console.log(data);
        
        //Check that the target's username exists
        var targetUsername = selectedPlayers;
        const targetIndex = this.thisRoom.playerUsernamesInGame.findIndex(username => username === targetUsername);
        if (targetIndex === -1) {
            socket.emit("danger-alert", "Error: User does not exist. Tell the admin if you see this.");
            return;
        }
        
        var indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;
        var refHistory = this.thisRoom.specialCards[this.card.toLowerCase()].refHistory;
        
        //Get index of socket 
        var indexOfSocket = undefined;
        for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
            // console.log("Comparing: " + this.thisRoom.playersInGame[i].username + " with " + socket.request.user.username);
            if (this.thisRoom.playersInGame[i].username === socket.request.user.username) {
                indexOfSocket = i;
                break;
            }
        }
        
        // console.log("Index of socket: ");
        // console.log(indexOfSocket);
        
        // If the requester is the ref holder, do the ref stuff
        if (indexOfCardHolder === indexOfSocket) {
            // Check if we can card that person
            if (refHistory.includes(selectedPlayers) === true) {
                socket.emit("danger-alert", "You cannot card that person.");
                return;
            }
            
            //grab the target's alliance
            var alliance = this.thisRoom.playersInGame[targetIndex].alliance;
            
            //emit to the ref holder the person's alliance
            socket.emit("lady-info", /*"Player " + */targetUsername + " is a " + alliance + ".");
            // console.log("Player " + target + " is a " + alliance);
            
            //update ref location
            this.thisRoom.specialCards[this.card.toLowerCase()].setHolder(targetIndex);
            
            // this.gameplayMessage = (socket.request.user.username + " has carded " + target);
            this.thisRoom.sendText(this.thisRoom.allSockets, (this.thisRoom.playerUsernamesInGame[indexOfSocket] + " has used " + this.card + " on " + targetUsername + "."), "gameplay-text");
            
            
            //update phase
            this.thisRoom.phase = "pickingTeam";
        }
        // The requester is not the ref holder. Ignore the request.
        else {
            socket.emit("danger-alert", "You do not hold the card.");
            
            return;
        }
        
    };
    
    buttonSettings (indexOfPlayer) {
        //Get the index of the ref
        var indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;
        
        var obj = {
            green: {},
            red: {}
        };
        
        if (indexOfPlayer === indexOfCardHolder) {
            obj.green.hidden = false;
            obj.green.disabled = true;
            obj.green.setText = "Card";
            
            obj.red.hidden = true;
            obj.red.disabled = true;
            obj.red.setText = "";
        }
        // If it is any other player who isn't special role
        else {
            obj.green.hidden = true;
            obj.green.disabled = true;
            obj.green.setText = "";
            
            obj.red.hidden = true;
            obj.red.disabled = true;
            obj.red.setText = "";
        }
        return obj;
    }
    
    numOfTargets (indexOfPlayer) {
        var indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;
        
        if (indexOfPlayer !== undefined && indexOfPlayer !== null) {
            // If indexOfPlayer is the ref holder, one player to select 
            if (indexOfPlayer === indexOfCardHolder) {
                return 1;
            }
            else {
                return null;
            }
        }
    }
    
    
    getStatusMessage (indexOfPlayer) {
        var indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;
        
        if (indexOfPlayer === indexOfCardHolder) {
            return "Choose a player to use the Ref of the Rain on.";
        }
        // If it is any other player who isn't special role
        else {
            var usernameOfCardHolder = this.thisRoom.playerUsernamesInGame[indexOfCardHolder];
            return "Waiting for " + usernameOfCardHolder + " to use the Ref of the Rain on someone."
        }
    }
    
    getProhibitedIndexesToPick (indexOfPlayer) {
        var refHistory = this.thisRoom.specialCards[this.card.toLowerCase()].refHistory;
        
        return refHistory;
    }
    
}



module.exports = Ref;

