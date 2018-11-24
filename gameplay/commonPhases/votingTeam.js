var usernamesIndexes = require("../../myFunctions/usernamesIndexes");

function VotingTeam(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.phase = "votingTeam";
    this.showGuns = true;
};

VotingTeam.prototype.gameMove = function(socket, data){        
    // Get the index of the user who is trying to vote
    var i = this.thisRoom.playersYetToVote.indexOf(socket.request.user.username);

    //Check the data is valid (if it is not a "yes" or a "no")
    if( !(data === "yes" || data === "no") ){
        return;
    }

    // If they haven't voted yet
    if(i !== -1){
        if(data === "yes"){
            this.thisRoom.votes[usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, socket.request.user.username)] = "approve";
        }
        else if(data === "no"){
            this.thisRoom.votes[usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, socket.request.user.username)] = "reject";
        }
        else {
            console.log("ERROR! this.thisRoom should definitely not happen. Game.js votingTeam.");
        }

        //remove the player from players yet to vote
        this.thisRoom.playersYetToVote.splice(i, 1);

        // If we have all of our votes, proceed onward
        if(this.thisRoom.playersYetToVote.length === 0){
            this.thisRoom.publicVotes = this.thisRoom.votes;
            this.thisRoom.VHUpdateTeamVotes();
            

            var outcome = calcVotes(this.thisRoom.votes);

            if(outcome === "yes"){
                this.thisRoom.phase = "votingMission";
                this.thisRoom.playersYetToVote = this.thisRoom.proposedTeam.slice();

                var str = "Mission " + this.thisRoom.missionNum + "." + this.thisRoom.pickNum + " was approved." + getStrApprovedRejectedPlayers(this.thisRoom.votes, this.thisRoom.playersInGame);
                this.thisRoom.sendText(this.thisRoom.allSockets, str, "gameplay-text");
            }
            //Hammer reject
            else if(outcome === "no" && this.thisRoom.pickNum >= 5){
                this.thisRoom.missionHistory[this.thisRoom.missionHistory.length] = "failed";

                this.thisRoom.howWasWon = "Hammer rejected.";
                this.thisRoom.finishGame("Spy");
            }
            else if (outcome === "no") {
                this.thisRoom.proposedTeam = [];
                this.thisRoom.phase = "pickingTeam";

                var str = "Mission " + this.thisRoom.missionNum + "." + this.thisRoom.pickNum + " was rejected." + getStrApprovedRejectedPlayers(this.thisRoom.votes, this.thisRoom.playersInGame);
                this.thisRoom.sendText(this.thisRoom.allSockets, str, "gameplay-text");

                this.thisRoom.incrementTeamLeader();
            }
        }

        this.thisRoom.distributeGameData();
    }
};



// Returns a object with green and red keys. 
// Green and Red must both have the following properties:
//  hidden          - Is the button hidden?
//  disabled        - Is the button disabled?
//  setText         - What text to display in the button
VotingTeam.prototype.buttonSettings = function(indexOfPlayer){  

    var obj = {
		green:{},
		red: {}
    };
    
    // If user has voted already
    if(this.thisRoom.playersYetToVote.indexOf(this.thisRoom.playersInGame[indexOfPlayer].username) === -1){
        obj.green.hidden = true;
        obj.green.disabled = true;
        obj.green.setText = "";

        obj.red.hidden = true;
        obj.red.disabled = true;
        obj.red.setText = "";
    }
    // User has not voted yet
    else{
        obj.green.hidden = false;
        obj.green.disabled = false;
        obj.green.setText = "Approve";

        obj.red.hidden = false;
        obj.red.disabled = false;
        obj.red.setText = "Reject";
    }

    return obj;    
}

VotingTeam.prototype.numOfTargets = function(indexOfPlayer){    
    return null;
}


VotingTeam.prototype.getStatusMessage = function(indexOfPlayer){  
    // If we are spectator
    if(indexOfPlayer === -1){
        var str = "";
        str += "Waiting for votes: ";
        for (var i = 0; i < this.thisRoom.playersYetToVote.length; i++) {
            str = str + this.thisRoom.playersYetToVote[i] + ", ";
        }
        // Remove last , and replace with .
        str = str.slice(0, str.length - 2);
        str += ".";

        return str;
    }
    // If user has voted already
    else if(indexOfPlayer !== undefined && this.thisRoom.playersYetToVote.indexOf(this.thisRoom.playersInGame[indexOfPlayer].username) === -1){
        var str = "";
        str += "Waiting for votes: ";
        for (var i = 0; i < this.thisRoom.playersYetToVote.length; i++) {
            str = str + this.thisRoom.playersYetToVote[i] + ", ";
        }
        // Remove last , and replace with .
        str = str.slice(0, str.length - 2);
        str += ".";

        return str;
    }
    // User has not voted yet or user is a spectator
    else{
        var str = "";
        str += (this.thisRoom.playersInGame[this.thisRoom.teamLeader].username + " has picked: ");

        for (var i = 0; i < this.thisRoom.proposedTeam.length; i++) {
            str += this.thisRoom.proposedTeam[i] + ", ";
        }
        // Remove last , and replace with .
        str = str.slice(0, str.length - 2);
        str += ".";

        return str;
    }
}



function getStrApprovedRejectedPlayers(votes, playersInGame) {
	var approvedUsernames = "";
	var rejectedUsernames = "";

	for (var i = 0; i < votes.length; i++) {

		if (votes[i] === "approve") {
			approvedUsernames = approvedUsernames + playersInGame[i].username + ", ";
		}
		else if (votes[i] === "reject") {
			rejectedUsernames = rejectedUsernames + playersInGame[i].username + ", ";
		}
		else {
			console.log("ERROR! Unknown vote: " + votes[i]);
		}
	}
	// Disabled approve rejected people.
	// var str = "<p>Approved: " + approvedUsernames + "</p> <p>Rejected: " + rejectedUsernames + "</p>"
	var str = "";

	return str;
}

function calcVotes(votes) {
	var numOfPlayers = votes.length;
	var countApp = 0;
	var countRej = 0;
	var outcome;

	for (var i = 0; i < numOfPlayers; i++) {
		if (votes[i] === "approve") {
			// console.log("app");
			countApp++;
		}
		else if (votes[i] === "reject") {
			// console.log("rej");
			countRej++;
		}
		else {
			console.log("Bad vote: " + votes[i]);
		}
	}
	//calcuate the outcome
	if (countApp > countRej) {
		outcome = "yes";
	}
	else {
		outcome = "no";
    }
    
	return outcome;
}






module.exports = VotingTeam;

