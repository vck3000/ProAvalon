/* Each phase must have:
    - Name
    - GameMove to perform operations
    - Buttons that are visible and what text they have
    - Number of targets allowed to be selected
    - Whether to show guns or not
    - Status message to display
*/
var usernamesIndexes = require("../../myFunctions/usernamesIndexes");

function PickingTeam(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.phase = "pickingTeam";
};


PickingTeam.prototype.gameMove = function(socket, data){        
    // If the person requesting is the host
    if(usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, socket.request.user.username) === this.thisRoom.teamLeader){
        //Reset votes
        this.thisRoom.votes = [];
        this.thisRoom.publicVotes = [];

        var num = this.thisRoom.numPlayersOnMission[this.thisRoom.playersInGame.length - this.thisRoom.minPlayers][this.thisRoom.missionNum - 1];
        console.log("Num player for this.thisRoom mission : " + num);

        //In case the mission num is 4*, make it 4.
        if(num.length > 1){ num = parseInt(num[0]); }
        else{ num = parseInt(num); }
        
        //Check that the data is valid (i.e. includes only usernames of players)
        for(var i = 0; i < num; i++){
            // If the data doesn't have the right number of users
            // Or has an empty element
            if(!data[i]){
                return; 
            }
            if(this.thisRoom.playerUsernamesInGame.includes(data[i]) === false){
                return;
            }
        }

        //Continue if it passes the above check
        this.thisRoom.proposedTeam = data;
        //.slice to clone the array
        this.thisRoom.playersYetToVote = this.thisRoom.playerUsernamesInGame.slice();

        //--------------------------------------
        //Send out the gameplay text
        //--------------------------------------
        var str = "";
        for (var i = 0; i < data.length; i++) {
            str += data[i] + ", ";
        }

        var str2 = socket.request.user.username + " has picked: " + str;
        
        //remove the last , and replace with .
        str2 = str2.slice(0, str2.length - 2);
        str2 += ".";

        this.thisRoom.sendText(this.thisRoom.allSockets, str2, "gameplay-text");
        
        this.thisRoom.VHUpdateTeamPick();

        this.thisRoom.phase = "votingTeam";
    }
    else{
        console.log("User is not the team leader. Cannot pick.");
    }
};



module.exports = PickingTeam;



