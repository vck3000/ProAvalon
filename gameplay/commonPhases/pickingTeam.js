const usernamesIndexes = require("../../myFunctions/usernamesIndexes");
const Phase = require("./phase");

class PickingTeam extends Phase {
    constructor(thisRoom) {
        super(thisRoom, "pickingTeam", false);
    }

    gameMove(socket, data) {
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
            for (let i = 0; i < num; i++) {
                // If the data doesn't have the right number of users
                // Or has an empty element
                if (!data[i] || !this.thisRoom.playerUsernamesInGame.includes(data[i])) {
                    return;
                }
            }

            // Continue if it passes the above check
            this.thisRoom.proposedTeam = data;
            // .slice to clone the array
            this.thisRoom.playersYetToVote = this.thisRoom.playerUsernamesInGame.slice();

            //--------------------------------------
            // Send out the gameplay text
            //--------------------------------------
            let str = "";
            for (let i = 0; i < data.length; i++) {
                str += `${data[i]}, `;
            }

            let str2 = `${socket.request.user.username} has picked: ${str}`;

            // remove the last , and replace with .
            str2 = str2.slice(0, str2.length - 2);
            str2 += ".";

            this.thisRoom.sendText(this.thisRoom.allSockets, str2, "gameplay-text");

            this.thisRoom.VHUpdateTeamPick();

            this.thisRoom.phase = "votingTeam";
        } else {
            console.log("User is not the team leader. Cannot pick.");
        }
    }

    buttonSettings(indexOfPlayer) {
        const obj = {
            green: {},
            red: {},
        };

        // If it is the host
        if (indexOfPlayer === this.thisRoom.teamLeader) {
            obj.green.hidden = false;
            obj.green.disabled = true;
            obj.green.setText = "Pick";

            obj.red.hidden = true;
            obj.red.disabled = true;
            obj.red.setText = "";
        }
        // If it is any other player who isn't host
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


    numOfTargets(indexOfPlayer) {
        let num = this.thisRoom.numPlayersOnMission[this.thisRoom.playersInGame.length - this.thisRoom.minPlayers][this.thisRoom.missionNum - 1];
        // console.log("Num player for this.thisRoom mission : " + num);

        // If we are not the team leader
        if (indexOfPlayer !== this.thisRoom.teamLeader) {
            return null;
        }

        // In case the mission num is 4*, make it 4.
        if (num.length > 1) { num = parseInt(num[0]); } else { num = parseInt(num); }

        return num;
    }


    getStatusMessage(indexOfPlayer) {
        if (indexOfPlayer !== undefined && indexOfPlayer === this.thisRoom.teamLeader) {
            const num = this.thisRoom.numPlayersOnMission[this.thisRoom.playersInGame.length - this.thisRoom.minPlayers][this.thisRoom.missionNum - 1];

            return `Your turn to pick a team. Pick ${num} players.`;
        }

        // console.log(this.thisRoom.teamLeader);
        if (this.thisRoom.playersInGame[this.thisRoom.teamLeader]) {
            return `Waiting for ${this.thisRoom.playersInGame[this.thisRoom.teamLeader].username} to pick a team.`;
        }

        return "ERROR: Tell the admin if you see this, code 10.";
    }
}

module.exports = PickingTeam;
