const usernamesIndexes = require('../../myFunctions/usernamesIndexes');

function PickingTeam(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.phase = 'pickingTeam';
    this.showGuns = false;
}


PickingTeam.prototype.gameMove = function (socket, buttonPressed, selectedPlayers) {
    if (buttonPressed !== 'yes') {
        // this.thisRoom.sendText(this.thisRoom.allSockets, `Button pressed was ${buttonPressed}. Let admin know if you see this.`, "gameplay-text");
        return;
    }

    const numOfTargets = this.thisRoom.getClientNumOfTargets(this.thisRoom.teamLeader);
    // catch wrong number of targets
    if (numOfTargets !== selectedPlayers.length && numOfTargets !== null) {
        return;
    }

    // If the person requesting is the host
    if (usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, socket.request.user.username) === this.thisRoom.teamLeader) {
        // Reset votes
        this.thisRoom.votes = [];
        this.thisRoom.publicVotes = [];

        let num = this.thisRoom.numPlayersOnMission[this.thisRoom.playersInGame.length - this.thisRoom.minPlayers][this.thisRoom.missionNum - 1];
        // console.log("Num player for this.thisRoom mission : " + num);

        // In case the mission num is 4*, make it 4.
        if (num.length > 1) { num = parseInt(num[0]); } else { num = parseInt(num); }

        // Check that the data is valid (i.e. includes only usernames of players)
        for (var i = 0; i < num; i++) {
            // If the data doesn't have the right number of users
            // Or has an empty element
            if (!selectedPlayers[i]) {
                return;
            }
            if (this.thisRoom.playerUsernamesInGame.includes(selectedPlayers[i]) === false) {
                return;
            }
        }

        // Continue if it passes the above check
        this.thisRoom.proposedTeam = selectedPlayers;
        // .slice to clone the array
        this.thisRoom.playersYetToVote = this.thisRoom.playerUsernamesInGame.slice();

        //--------------------------------------
        // Send out the gameplay text
        //--------------------------------------
        let str = '';
        for (var i = 0; i < selectedPlayers.length; i++) {
            str += `${selectedPlayers[i]}, `;
        }

        let str2 = `${socket.request.user.username} has picked: ${str}`;

        // remove the last , and replace with .
        str2 = str2.slice(0, str2.length - 2);
        str2 += '.';

        this.thisRoom.sendText(this.thisRoom.allSockets, str2, 'gameplay-text');

        this.thisRoom.VHUpdateTeamPick();

        this.thisRoom.phase = 'votingTeam';
    } else {
        console.log(`User ${socket.request.user.username} is not the team leader. Cannot pick.`);
    }
};


// Returns a object with green and red keys.
// Green and Red must both have the following properties:
//  hidden          - Is the button hidden?
//  disabled        - Is the button disabled?
//  setText         - What text to display in the button
PickingTeam.prototype.buttonSettings = function (indexOfPlayer) {
    const obj = {
        green: {},
        red: {},
    };

    // If it is the host
    if (indexOfPlayer === this.thisRoom.teamLeader) {
        obj.green.hidden = false;
        obj.green.disabled = true;
        obj.green.setText = 'Pick';

        obj.red.hidden = true;
        obj.red.disabled = true;
        obj.red.setText = '';
    }
    // If it is any other player who isn't host
    else {
        obj.green.hidden = true;
        obj.green.disabled = true;
        obj.green.setText = '';

        obj.red.hidden = true;
        obj.red.disabled = true;
        obj.red.setText = '';
    }

    return obj;
};


PickingTeam.prototype.numOfTargets = function (indexOfPlayer) {
    let num = this.thisRoom.numPlayersOnMission[this.thisRoom.playersInGame.length - this.thisRoom.minPlayers][this.thisRoom.missionNum - 1];
    // console.log("Num player for this.thisRoom mission : " + num);

    // If we are not the team leader
    if (indexOfPlayer !== this.thisRoom.teamLeader) {
        return null;
    }

    // In case the mission num is 4*, make it 4.
    if (num.length > 1) { num = parseInt(num[0]); } else { num = parseInt(num); }

    return num;
};


PickingTeam.prototype.getStatusMessage = function (indexOfPlayer) {
    if (indexOfPlayer !== undefined && indexOfPlayer === this.thisRoom.teamLeader) {
        const num = this.thisRoom.numPlayersOnMission[this.thisRoom.playersInGame.length - this.thisRoom.minPlayers][this.thisRoom.missionNum - 1];

        return `Your turn to pick a team. Pick ${num} players.`;
    }

    // console.log(this.thisRoom.teamLeader);
    if (this.thisRoom.playersInGame[this.thisRoom.teamLeader]) {
        return `Waiting for ${this.thisRoom.playersInGame[this.thisRoom.teamLeader].username} to pick a team.`;
    }

    return 'ERROR: Tell the admin if you see this, code 10.';
};


module.exports = PickingTeam;
