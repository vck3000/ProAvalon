/* Each phase must have:
    - Name
    - GameMove to perform operations
    - Buttons that are visible and what text they have
    - Number of targets allowed to be selected
    - Whether to show guns or not
    - Status message to display
*/
var usernamesIndexes = require("../../myFunctions/usernamesIndexes");

function VotingTeam(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.phase = "votingTeam";
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

