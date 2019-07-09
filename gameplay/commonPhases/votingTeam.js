const Phase = require("./phase");
const usernamesIndexes = require("../../myFunctions/usernamesIndexes");

class VotingTeam extends Phase {
    constructor(thisRoom) {
        super(thisRoom, "votingTeam", true);
    }

    gameMove(socket, data) {
        // Get the index of the user who is trying to vote
        const i = this.thisRoom.playersYetToVote.indexOf(socket.request.user.username);

        // Check the data is valid (if it is not a "yes" or a "no")
        if (!(data === "yes" || data === "no")) {
            return;
        }

        // If they haven't voted yet
        if (i !== -1) {
            if (data === "yes") {
                this.thisRoom.votes[usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, socket.request.user.username)] = "approve";
            } else if (data === "no") {
                this.thisRoom.votes[usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, socket.request.user.username)] = "reject";
            } else {
                console.log("ERROR! this.thisRoom should definitely not happen. Game.js votingTeam.");
            }

            // remove the player from players yet to vote
            this.thisRoom.playersYetToVote.splice(i, 1);

            // If we have all of our votes, proceed onward
            if (this.thisRoom.playersYetToVote.length === 0) {
                this.thisRoom.publicVotes = this.thisRoom.votes;
                this.thisRoom.VHUpdateTeamVotes();


                const outcome = calcVotes(this.thisRoom.votes);

                if (outcome === "yes") {
                    this.thisRoom.phase = "votingMission";
                    this.thisRoom.playersYetToVote = this.thisRoom.proposedTeam.slice();

                    const str = `Mission ${this.thisRoom.missionNum}.${this.thisRoom.pickNum} was approved.${getStrApprovedRejectedPlayers(this.thisRoom.votes, this.thisRoom.playersInGame)}`;
                    this.thisRoom.sendText(this.thisRoom.allSockets, str, "gameplay-text");
                }
                // Hammer reject
                else if (outcome === "no" && this.thisRoom.pickNum >= 5) {
                    this.thisRoom.missionHistory[this.thisRoom.missionHistory.length] = "failed";

                    this.thisRoom.howWasWon = "Hammer rejected.";
                    this.thisRoom.sendText(this.thisRoom.allSockets, "The hammer was rejected.", "gameplay-text-red");

                    this.thisRoom.finishGame("Spy");
                } else if (outcome === "no") {
                    this.thisRoom.proposedTeam = [];
                    this.thisRoom.phase = "pickingTeam";

                    const str = `Mission ${this.thisRoom.missionNum}.${this.thisRoom.pickNum} was rejected.${getStrApprovedRejectedPlayers(this.thisRoom.votes, this.thisRoom.playersInGame)}`;
                    this.thisRoom.sendText(this.thisRoom.allSockets, str, "gameplay-text");

                    this.thisRoom.incrementTeamLeader();
                }
            }

            this.thisRoom.distributeGameData();
        }
    }

    buttonSettings(indexOfPlayer) {
        const obj = {
            green: {},
            red: {},
        };

        // If user has voted already
        if (this.thisRoom.playersYetToVote.indexOf(this.thisRoom.playersInGame[indexOfPlayer].username) === -1) {
            obj.green.hidden = true;
            obj.green.disabled = true;
            obj.green.setText = "";

            obj.red.hidden = true;
            obj.red.disabled = true;
            obj.red.setText = "";
        }
        // User has not voted yet
        else {
            obj.green.hidden = false;
            obj.green.disabled = false;
            obj.green.setText = "Approve";

            obj.red.hidden = false;
            obj.red.disabled = false;
            obj.red.setText = "Reject";
        }

        return obj;
    }

    getStatusMessage(indexOfPlayer) {
        // If we are spectator
        if (indexOfPlayer === -1) {
            let str = "";
            str += "Waiting for votes: ";
            for (let i = 0; i < this.thisRoom.playersYetToVote.length; i++) {
                str = `${str + this.thisRoom.playersYetToVote[i]}, `;
            }
            // Remove last , and replace with .
            str = str.slice(0, str.length - 2);
            str += ".";

            return str;
        }
        // If user has voted already
        if (indexOfPlayer !== undefined && this.thisRoom.playersYetToVote.indexOf(this.thisRoom.playersInGame[indexOfPlayer].username) === -1) {
            let str = "";
            str += "Waiting for votes: ";
            for (let i = 0; i < this.thisRoom.playersYetToVote.length; i++) {
                str = `${str + this.thisRoom.playersYetToVote[i]}, `;
            }
            // Remove last , and replace with .
            str = str.slice(0, str.length - 2);
            str += ".";

            return str;
        }
        // User has not voted yet or user is a spectator

        let str = "";
        str += (`${this.thisRoom.playersInGame[this.thisRoom.teamLeader].username} has picked: `);

        for (let i = 0; i < this.thisRoom.proposedTeam.length; i++) {
            str += `${this.thisRoom.proposedTeam[i]}, `;
        }
        // Remove last , and replace with .
        str = str.slice(0, str.length - 2);
        str += ".";

        return str;
    }
}

function getStrApprovedRejectedPlayers(votes, playersInGame) {
    let approvedUsernames = "";
    let rejectedUsernames = "";

    for (let i = 0; i < votes.length; i++) {
        if (votes[i] === "approve") {
            approvedUsernames = `${approvedUsernames + playersInGame[i].username}, `;
        } else if (votes[i] === "reject") {
            rejectedUsernames = `${rejectedUsernames + playersInGame[i].username}, `;
        } else {
            console.log(`ERROR! Unknown vote: ${votes[i]}`);
        }
    }
    // Disabled approve rejected people.
    // let str = "<p>Approved: " + approvedUsernames + "</p> <p>Rejected: " + rejectedUsernames + "</p>"
    const str = "";

    return str;
}

function calcVotes(votes) {
    const numOfPlayers = votes.length;
    let countApp = 0;
    let countRej = 0;
    let outcome;

    for (let i = 0; i < numOfPlayers; i++) {
        if (votes[i] === "approve") {
            // console.log("app");
            countApp++;
        } else if (votes[i] === "reject") {
            // console.log("rej");
            countRej++;
        } else {
            // console.log("Bad vote: " + votes[i]);
        }
    }
    // calcuate the outcome
    if (countApp > countRej) {
        outcome = "yes";
    } else {
        outcome = "no";
    }

    return outcome;
}


module.exports = VotingTeam;
