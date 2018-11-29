var usernamesIndexes = require("../../myFunctions/usernamesIndexes");

function VotingMission(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.phase = "votingMission";
    this.showGuns = true;
};

VotingMission.prototype.gameMove = function(socket, data){        
    var i = this.thisRoom.playersYetToVote.indexOf(socket.request.user.username);

    //if this.thisRoom vote is coming from someone who hasn't voted yet
    if (i !== -1) {
        if (data === "yes") {
            this.thisRoom.missionVotes[usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, socket.request.user.username)] = "succeed";
            // console.log("received succeed from " + socket.request.user.username);
        }
        else if (data === "no") {
            // If the user is a res, they shouldn't be allowed to fail
            var index = usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, socket.request.user.username);
            if(index !== -1 && this.thisRoom.playersInGame[index].alliance === "Resistance"){
                socket.emit("danger-alert", "You are resistance! Surely you want to succeed!");
                return;
            }

            this.thisRoom.missionVotes[usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, socket.request.user.username)] = "fail";
            // console.log("received fail from " + socket.request.user.username);
        }
        else {
            console.log("ERROR! Expected yes or no (success/fail), got: " + data);
        }
        //remove the player from players yet to vote
        this.thisRoom.playersYetToVote.splice(i, 1);
    }
    else {
        console.log("Player " + socket.request.user.username + " has already voted or is not in the game");
    }


    // If we have all the votes in
    if (this.thisRoom.playersYetToVote.length === 0) {

        var outcome = this.thisRoom.calcMissionVotes(this.thisRoom.missionVotes);
        if (outcome) {
            this.thisRoom.missionHistory.push(outcome);
        }
        else {
            console.log("ERROR! Outcome was: " + outcome);
        }

        //for the gameplay message
        if (outcome === "succeeded") {
            //get number of fails
            var numOfVotedFails = countFails(this.thisRoom.missionVotes);

            if (numOfVotedFails === 0) {	
                this.thisRoom.sendText(this.thisRoom.allSockets, "Mission " + this.thisRoom.missionNum + " succeeded.", "gameplay-text-blue");
            }
            else {
                this.thisRoom.sendText(this.thisRoom.allSockets, "Mission " + this.thisRoom.missionNum + " succeeded, but with " + numOfVotedFails + " fail.", "gameplay-text-blue");
            }
        }
        else if (outcome === "failed") {
            //get number of fails
            var numOfVotedFails = countFails(this.thisRoom.missionVotes);

            if(numOfVotedFails > 1){
                this.thisRoom.moreThanOneFailMissions[this.thisRoom.missionNum] = true;
            }

            if (numOfVotedFails === 1) {	
                this.thisRoom.sendText(this.thisRoom.allSockets, "Mission " + this.thisRoom.missionNum + " failed with " + numOfVotedFails + " fail.", "gameplay-text-red");
            }
            else {
                this.thisRoom.sendText(this.thisRoom.allSockets, "Mission " + this.thisRoom.missionNum + " failed with " + numOfVotedFails + " fails.", "gameplay-text-red");
            }
        }

        
        //if we get all the votes in, then do this.thisRoom
        this.thisRoom.lastProposedTeam = this.thisRoom.proposedTeam;
        this.thisRoom.proposedTeam = [];
        this.thisRoom.missionVotes = [];

        //count number of succeeds and fails
        var numOfSucceeds = 0;
        var numOfFails = 0;
        for (var i = 0; i < this.thisRoom.missionHistory.length; i++) {
            if (this.thisRoom.missionHistory[i] === "succeeded") {
                numOfSucceeds++;
            }
            else if (this.thisRoom.missionHistory[i] === "failed") {
                numOfFails++;
            }
        }


        //game over if more than 3 fails or successes
        if (numOfFails >= 3) {
            this.thisRoom.winner = "Spy";
            this.thisRoom.finishGame("Spy");
        }
        else if (numOfSucceeds >= 3) {
            this.thisRoom.winner = "Resistance";
            this.thisRoom.finishGame("Resistance");
        }
        // If the game goes on
        else{
            this.thisRoom.missionNum++;
            this.thisRoom.pickNum = 1;
            this.thisRoom.teamLeader--;
            if (this.thisRoom.teamLeader < 0) {
                this.thisRoom.teamLeader = this.thisRoom.socketsOfPlayers.length - 1;
            }
            this.thisRoom.hammer = ((this.thisRoom.teamLeader - 5 + 1 + this.thisRoom.playersInGame.length) % this.thisRoom.playersInGame.length);
            this.thisRoom.phase = "pickingTeam";	
        }
    }
};



// Returns a object with green and red keys. 
// Green and Red must both have the following properties:
//  hidden          - Is the button hidden?
//  disabled        - Is the button disabled?
//  setText         - What text to display in the button
VotingMission.prototype.buttonSettings = function(indexOfPlayer){  

    var obj = {
		green:{},
		red: {}
    };
    
    // If user has voted
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
        obj.green.setText = "SUCCEED";

        obj.red.hidden = false;
        obj.red.disabled = false;
        obj.red.setText = "FAIL";
    }

    return obj;    
}

VotingMission.prototype.numOfTargets = function(indexOfPlayer){    
    return null;
}

VotingMission.prototype.getStatusMessage = function(indexOfPlayer){  
    // If we are spectator
    if(indexOfPlayer === -1){
        var str = "";
        str += "Waiting for mission votes: ";
        for (var i = 0; i < this.thisRoom.playersYetToVote.length; i++) {
            str = str + this.thisRoom.playersYetToVote[i] + ", ";
        }
        // Remove last , and replace with .
        str = str.slice(0, str.length - 2);
        str += ".";

        return str;
    }
    //If the user is someone who needs to vote success or fail
    else if(indexOfPlayer !== undefined && this.thisRoom.playersYetToVote.indexOf(this.thisRoom.playersInGame[indexOfPlayer].username) !== -1){
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
    else{
        var str = "";
        str += "Waiting for mission votes: ";
        for (var i = 0; i < this.thisRoom.playersYetToVote.length; i++) {
            str = str + this.thisRoom.playersYetToVote[i] + ", ";
        }
        // Remove last , and replace with .
        str = str.slice(0, str.length - 2);
        str += ".";

        return str;
    }
}



function countFails(votes) {
	var numOfVotedFails = 0;
	for (var i = 0; i < votes.length; i++) {
		if (votes[i] === "fail") {
			numOfVotedFails++;
		}
	}
	return numOfVotedFails;
}





module.exports = VotingMission;
