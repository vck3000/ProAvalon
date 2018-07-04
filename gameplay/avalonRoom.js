//avalon room object

var util = require("util");

var mongoose = require("mongoose");
var User = require("../models/user");
var GameRecord = require("../models/gameRecord");

mongoose.connect("mongodb://localhost/TheNewResistanceUsers");




// var sockets = [];

var minPlayers = 5;
// var host;

// var roomId;


// var roles = [
// "Merlin",
// "Percival",
// "Morgana",
// "Assassin",
// "Resistance",

// //6P addition
// "Resistance",

// //7P addition
// "Spy"
// ];


var alliances = [
	"Resistance",
	"Resistance",
	"Resistance",
	"Spy",
	"Spy",
	"Resistance",
	"Spy",
	"Resistance",
	"Resistance",
	"Spy"

]


var numPlayersOnMission = [
	["2", "3", "2", "3", "3"],
	["2", "3", "4", "3", "4"],
	["2", "3", "3", "4*", "4"],
	["3", "4", "4", "5*", "5"],
	["3", "4", "4", "5*", "5"],
	["3", "4", "4", "5*", "5"],
]

/*

5p - fab 4 + vt
6p - fab 4 + vt + vt 
7p - fab 4 + vt + vt + vs

*/






module.exports = function (host_, roomId_, io_) {

	this.io = io_;

	this.playersInGame = [];
	this.player = [];
	this.gameStarted = false;
	this.finished = false;
	this.destroyRoom = false;
	this.playersInRoom = [];

	this.teamLeader = 0;
	this.hammer = 0;
	this.missionNum = 0;
	this.missionHistory = [];
	this.pickNum = 0;
	this.gameHistory = [];
	this.lady = undefined;
	this.ladyablePeople = [];

	this.playersYetToVote = [];
	// this.votingPhase = false;
	this.proposedTeam = [];
	this.votes = [];
	this.missionVotes = [];
	this.gameplayMessage = "";

	this.voteHistory = {};

	this.phase = "picking";
	this.playerShot;

	//Just to know who is the current host.
	this.host = host_;
	this.roomId = roomId_;
	//NOTE this is the list of sockets of PLAYERS IN THE GAME
	//not including spectators
	this.sockets = [];

	this.socketsOfSpectators = [];

	this.canJoin = true;
	this.options = undefined;

	this.kickedPlayers = {};
	this.claimingPlayers = {};

	this.winner = "";

	var shuffledPlayerAssignments = [];


	this.finishGame = function (winner) {
		if (winner === "spy") {
			//spies win, nothing more to do.
			this.winner = "spies";
			//if it has already been set, then its probably hammer rejected
			//otherwise set it to mission fails
			if(!this.howWasWon){
				this.howWasWon = "Mission fails.";
			}
			this.gameEnd();
		}
		else if (winner === "res") {
			//SHOOT THE MERLIN!
			var assassinIsInGame = false;
			for (var i = 0; i < this.playersInGame.length; i++) {
				if (this.playersInGame[i].role === "Assassin") {
					assassinIsInGame = true;
					break;
				}
			}

			if (assassinIsInGame === true) {
				this.phase = "assassination";
				this.startAssassinationTime = new Date();
			}
			else {
				this.winner = "resistance";
				this.howWasWon = "Mission successes"
				this.gameEnd();
			}
		}
		else {
			console.log("ERROR! winner was: " + winner);
		}
	}

	this.gameEnd = function () {
		//game clean up
		this.finished = true;
		this.phase = "finished";

		if (this.winner === "spies") {
			// this.gameplayMessage = "The spies have won the game.";
			sendText(this.sockets, "The spies have won the game.", "gameplay-text");
		}
		else if (this.winner === "resistance") {
			// this.gameplayMessage = "The resistance have won the game.";
			sendText(this.sockets, "The resistance have won the game.", "gameplay-text");
		}

		//store data into the database:
		var rolesCombined = [];
		
		//combine roles
		for(var i = 0; i < (this.resRoles.length + this.spyRoles.length); i++){
			if(i < this.resRoles.length){
				rolesCombined[i] = this.resRoles[i];
			}
			else{
				rolesCombined[i] = this.spyRoles[i-this.resRoles.length];
			}
		}

		var playerRolesVar = {};

		for(var i = 0; i < this.playersInGame.length; i++){
			playerRolesVar[this.playersInGame[i].username] = {
				alliance: this.playersInGame[i].alliance,
				role: this.playersInGame[i].role
			}
		}
		
		var objectToStore = {
			timeGameStarted: this.startGameTime,
			timeAssassinationStarted: this.startAssassinationTime,
			timeGameFinished: new Date(),
			winningTeam: this.winner,
			spyTeam: this.spyUsernames,
			resistanceTeam: this.resistanceUsernames,
			numberOfPlayers: this.sockets.length,
			howTheGameWasWon: this.howWasWon,
			roles: rolesCombined,

			missionHistory: this.missionHistory,
			voteHistory: this.voteHistory,
			playerRoles: playerRolesVar
		};

		GameRecord.create(objectToStore, function(err){
			if(err){
				console.log(err);
			}
			else{
				console.log("Stored game data successfully.");
			}
		})
	}

	this.assassinate = function (socket, target) {

		//check if socket came from ASSASSIN!!!!
		//INCOMPMLETEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE!

		if (this.phase === "assassination") {
			//get the merlin's uesrname
			var playerRoles = this.playersInGame;
			var merlinUsername = undefined;
			for (var i = 0; i < playerRoles.length; i++) {
				if (playerRoles[i].role === "Merlin") {
					merlinUsername = playerRoles[i].username;
				}
			}

			//set the player shot
			this.playerShot = target[0];

			console.log("merlin username: " + merlinUsername);
			if (merlinUsername && target[0] === merlinUsername) {
				this.winner = "spies";
				this.howWasWon = "Assassinated Merlin correctly."
			}
			else {
				this.winner = "resistance";
				this.howWasWon = "Mission successes and Merlin did not die."
			}

			this.gameEnd();
		}
		else {
			console.log("Not assassination phase yet");
		}
	}

	this.useLady = function (socket, target) {
		//check that the person making this request has the lady
		if (getIndexFromUsername(this.sockets, socket.request.user.username) === this.lady && this.phase === "lady" && this.ladyablePeople[getIndexFromUsername(this.sockets, target)] === true) {
			//grab the target's alliance
			var alliance = this.playersInGame[getIndexFromUsername(this.sockets, target)].alliance;

			//emit to the lady holder the person's alliance
			socket.emit("lady-info", "Player " + target + " is a " + alliance);
			console.log("Player " + target + " is a " + alliance);

			//update lady location
			this.lady = getIndexFromUsername(this.sockets, target);
			//make that person no longer ladyable
			this.ladyablePeople[this.lady] = false;

			// this.gameplayMessage = (socket.request.user.username + " has carded " + target);
			sendText(this.sockets, (socket.request.user.username + " has carded " + target), "gameplay-text");


			//update phase
			this.phase = "picking";
		}
	}


	this.missionVote = function (socket, voteStr) {
		if (this.phase === "missionVoting") {

			var i = this.playersYetToVote.indexOf(socket.request.user.username);

			//if this vote is coming from someone who hasn't voted yet
			if (i !== -1) {
				if (voteStr === "succeed") {
					this.missionVotes[getIndexFromUsername(this.sockets, socket.request.user.username)] = "succeed";
					console.log("received succeed from " + socket.request.user.username);
				}
				else if (voteStr === "fail") {
					this.missionVotes[getIndexFromUsername(this.sockets, socket.request.user.username)] = "fail";
					console.log("received fail from " + socket.request.user.username);
				}
				else {
					console.log("ERROR! Expected succeed or fail, got: " + voteStr);
				}
				//remove the player from players yet to vote
				this.playersYetToVote.splice(i, 1);
			}
			else {
				console.log("Player has already voted or is not in the game");
			}
		}

		//CALCULATE OUTCOME OF THE MISSION
		if (this.playersYetToVote.length === 0) {

			//perform these functions here now.
			this.teamLeader--;
			if (this.teamLeader < 0) {
				this.teamLeader = this.sockets.length - 1;
			}
			this.pickNum++;

			
			var requiresTwoFails = false;
			if (this.playersInGame.length >= 7 && this.missionNum === 4) {
				requiresTwoFails = true;
			}

			var outcome = calcMissionVotes(this.missionVotes, requiresTwoFails);
			if (outcome) {
				this.missionHistory.push(outcome);
			}
			else {
				console.log("ERROR! Outcome was: " + outcome);
			}

			//for the gameplay message
			if (outcome === "succeeded") {
				//get number of fails
				var numOfVotedFails = countFails(this.missionVotes);

				if (numOfVotedFails === 0) {
					// this.gameplayMessage = "The mission succeeded.";	
					sendText(this.sockets, "Mission " + this.missionNum + " has succeeded", "gameplay-text");

				}
				else {
					// this.gameplayMessage = "The mission succeeded, but with " + numOfVotedFails + " fails.";
					sendText(this.sockets, "Mission " + this.missionNum + " succeeded, but with " + numOfVotedFails + " fails.", "gameplay-text");

				}


			}
			else if (outcome === "failed") {
				//get number of fails
				var numOfVotedFails = countFails(this.missionVotes);
				if (numOfVotedFails === 1) {
					// this.gameplayMessage = "The mission failed with " + numOfVotedFails + " fail.";	
					sendText(this.sockets, "Mission " + this.missionNum + " failed with " + numOfVotedFails + " fail.", "gameplay-text");

				}
				else {
					// this.gameplayMessage = "The mission failed with " + numOfVotedFails + " fails.";	
					sendText(this.sockets, "Mission " + this.missionNum + " failed with " + numOfVotedFails + " fails.", "gameplay-text");

				}

			}

			this.missionNum++;
			this.pickNum = 1;
			//if we get all the votes in, then do this
			this.proposedTeam = [];
			this.missionVotes = [];

			//count number of succeeds and fails
			var numOfSucceeds = 0;
			var numOfFails = 0;
			for (var i = 0; i < this.missionHistory.length; i++) {
				if (this.missionHistory[i] === "succeeded") {
					numOfSucceeds++;
				}
				else if (this.missionHistory[i] === "failed") {
					numOfFails++;
				}
			}

			console.log("numOfSucceeds: " + numOfSucceeds);
			console.log("numOfFails: " + numOfFails);

			//+1 to compensate for somewhere...
			this.hammer = ((this.teamLeader - 5 + 1 + this.sockets.length) % this.sockets.length);


			this.phase = "picking";
			//only lady of the lake after m1 and m2 have finished.
			if (this.lady !== undefined && this.missionNum >= 3) {
				this.phase = "lady";

			}

			//game over
			//if we have 3 fails, game finish
			if (numOfFails >= 3) {
				//pass through the winner

				this.finishGame("spy");
			}
			else if (numOfSucceeds >= 3) {
				//pass through the winner
				this.finishGame("res");
				// console.log("RES WON, NOW GOING INTO ASSASSINATION");
			}

			

		}
		// console.log("Players yet to vote: " + util.inspect(this.playersYetToVote, { depth: 2 }));
	}

	this.pickVote = function (socket, voteStr) {
		if (this.phase === "voting") {

			var i = this.playersYetToVote.indexOf(socket.request.user.username);

			//if this vote is coming from someone who hasn't voted yet
			if (i !== -1) {
				if (voteStr === "approve") {
					this.votes[getIndexFromUsername(this.sockets, socket.request.user.username)] = "approve";
					console.log("received approve from " + socket.request.user.username);
				}
				else if (voteStr === "reject") {
					this.votes[getIndexFromUsername(this.sockets, socket.request.user.username)] = "reject";
					console.log("received reject from " + socket.request.user.username);
				}
				else {
					console.log("ERROR! Expected approve or reject, got: " + voteStr);
				}
				//remove the player from players yet to vote
				this.playersYetToVote.splice(i, 1);
			}
			else {
				console.log("Player has already voted or is not in the game");
			}
		}

		//if our votes array is the same length as the number of players, then we have
		//all of our votes. proceed to next part of the game.
		if (this.playersYetToVote.length === 0) {
			var outcome = calcVotes(this.votes);

			//this.proposedTeam = [];


			//if team was approved, then reset pickNum
			//and increment missionNum
			if (outcome === "approved") {

				this.phase = "missionVoting";
				this.playersYetToVote = this.proposedTeam.slice();

				var str = "Mission " + this.missionNum + "." + this.pickNum + " was approved." + getStrApprovedRejectedPlayers(this.votes, this.playersInGame);
				// this.gameplayMessage = str;
				sendText(this.sockets, str, "gameplay-text");

				//temporarily increase the team leader so that when mission is approved 
				//the leader star will stay since we automatically teamLeader-- at the end of this block.
			}
			else if (this.pickNum >= 5 && outcome === "rejected") {
				console.log("--------------------------");
				console.log("HAMMER REJECTED, GAME OVER");
				console.log("--------------------------");

				//set the mission to fail
				this.missionHistory[this.missionHistory.length] = "failed";

				//finish the game, spies have won
				//send through winner
				this.howWasWon = "Hammer rejected.";
				this.finishGame("spy");

				// this.gameplayMessage = "Spies have won!";
			}
			else if (outcome === "rejected") {
				this.phase = "picking";

				var str = "Mission " + this.missionNum + "." + this.pickNum + " was rejected." + getStrApprovedRejectedPlayers(this.votes, this.playersInGame);
				// this.gameplayMessage = str;
				sendText(this.sockets, str, "gameplay-text");

			}

			//VH:
			for (var i = 0; i < this.sockets.length; i++) {
				if (this.voteHistory[this.sockets[i].request.user.username][this.missionNum - 1] === undefined) {
					this.voteHistory[this.sockets[i].request.user.username][this.missionNum - 1] = [];
				}
				if (this.voteHistory[this.sockets[i].request.user.username][this.missionNum - 1][this.pickNum - 1] === undefined) {
					console.log("Clear leader and picked from pickVote");
					this.voteHistory[this.sockets[i].request.user.username][this.missionNum - 1][this.pickNum - 1] = "";
				}

				this.voteHistory[this.sockets[i].request.user.username][this.missionNum - 1][this.pickNum - 1] += ("VH" + this.votes[i]);

			}


			if(outcome !== "approved"){
				//move to next team Leader, and reset it back to the start if 
				//we go into negative numbers
				this.teamLeader--;
				if (this.teamLeader < 0) {
					this.teamLeader = this.sockets.length - 1;
				}
				this.pickNum++;
			}
			
			
		}

		console.log("Players yet to vote: " + util.inspect(this.playersYetToVote, { depth: 2 }));
	}



	this.playerPickTeam = function (socket, pickedTeam) {
		//reset the votes:
		this.votes = [];

		//if the person who submitted the pick team is the team leader of the time, allow and go ahead
		if (getIndexFromUsername(this.sockets, socket.request.user.username) === this.teamLeader) {
			console.log("Team leader has picked: ");

			// var splitStr = pickedTeam.split(" ");
			// for(var i = 0; i < splitStr.length-1; i++){

			// 	console.log(splitStr[i] + " and ");

			// 	this.proposedTeam[i] = splitStr[i];
			// }

			//set the proposed team
			this.proposedTeam = pickedTeam;
			//change phase
			this.phase = "voting";
			//players yet to vote are all players in game
			this.playersYetToVote = this.getUsernamesInGame();

			var str = "";
			for (var i = 0; i < pickedTeam.length; i++) {
				str += pickedTeam[i] + ", ";
			}

			var str2 = socket.request.user.username + " has picked: " + str;
			this.gameplayMessage = str2;
			sendText(this.sockets, str2, "gameplay-text");


			//VH:
			for (var i = 0; i < this.sockets.length; i++) {
				if (this.voteHistory[this.sockets[i].request.user.username][this.missionNum - 1] === undefined) {
					this.voteHistory[this.sockets[i].request.user.username][this.missionNum - 1] = [];
				}
				if (this.voteHistory[this.sockets[i].request.user.username][this.missionNum - 1][this.pickNum - 1] === undefined) {
					console.log("Clear leader and picked from playerPickTeam");
					this.voteHistory[this.sockets[i].request.user.username][this.missionNum - 1][this.pickNum - 1] = "";
				}


				if (this.proposedTeam.indexOf(this.sockets[i].request.user.username) !== -1) {
					this.voteHistory[this.sockets[i].request.user.username][this.missionNum - 1][this.pickNum - 1] += "VHpicked ";
				}

				if (i === this.teamLeader) {
					this.voteHistory[this.sockets[i].request.user.username][this.missionNum - 1][this.pickNum - 1] += "VHleader ";
				}
			}



		}
		else {
			console.log("You are not the team leader, you cannot make a pick");
		}
	}

	this.getStatusMessage = function () {
		if (this.phase === "picking") {
			// console.log(this.teamLeader);
			var str = "Waiting on " + this.playersInGame[this.teamLeader].username + " to pick.";
			return str;
		}
		else if (this.phase === "voting") {
			var str = "Voting phase";
			return str;
		}
		else if (this.phase === "lady") {
			return "Waiting for Lady of the Lake to be used.";
		}
		else if (this.phase === "finished") {
			var str = "Game has finished. The " + this.winner + " have won.";
			return str;
		}
		else {
			return false;
		}
	};

	this.getGameDataForSpectators = function () {
		// return false;
		var playerRoles = this.playersInGame;

		//set up the spectator data object
		var data = {};

		data.see = {};
		data.see.spies = [];
		data.see.merlins = [];

		data.statusMessage = this.getStatusMessage();
		data.missionNum = this.missionNum;
		data.missionHistory = this.missionHistory;
		data.pickNum = this.pickNum;
		data.gameHistory = this.gameHistory;
		data.teamLeader = this.teamLeader;
		data.lady = this.lady;
		data.hammer = this.hammer;

		data.playersYetToVote = this.playersYetToVote;
		data.phase = this.phase;
		data.proposedTeam = this.proposedTeam;

		data.numPlayersOnMission = numPlayersOnMission[playerRoles.length - minPlayers]; //- 5

		data.votes = this.votes;
		data.voteHistory = this.voteHistory;
		data.hammer = this.hammer;
		data.winner = this.winner;

		data.gameplayMessage = this.gameplayMessage;

		data.spectator = true;

		//if game is finished, reveal everything including roles
		if (this.phase === "finished") {
			data.see.spies = this.getAllSpies();
			data.see.roles = this.getRevealedRoles();
			data.see.playerShot = this.playerShot;
		}

		return data;
	}

	this.getGameData = function () {

		if(this.gameStarted == true){
			//get the player roles first
			console.log("Get game data called within avalonRoom");

			var data = {};

			var playerRoles = this.playersInGame;
			// console.log("Player roles: " + playerRoles);

			// console.log("player length: " + playerRoles.length);

			//set up the object first, because we cannot pass an array through
			//socket.io
			for (var i = 0; i < playerRoles.length; i++) {
				data[i] = {
					alliance: playerRoles[i].alliance,
					role: playerRoles[i].role,
					see: playerRoles[i].see,
					username: playerRoles[i].username,
					socketId: playerRoles[i].socketId
				}

				//add on these common variables:
				data[i].statusMessage = this.getStatusMessage();
				data[i].missionNum = this.missionNum;
				data[i].missionHistory = this.missionHistory;
				data[i].pickNum = this.pickNum;
				data[i].gameHistory = this.gameHistory;
				data[i].teamLeader = this.teamLeader;
				data[i].hammer = this.hammer;
				data[i].lady = this.lady;
				data[i].ladyablePeople = this.ladyablePeople;

				data[i].playersYetToVote = this.playersYetToVote;
				data[i].phase = this.phase;
				data[i].proposedTeam = this.proposedTeam;

				data[i].numPlayersOnMission = numPlayersOnMission[playerRoles.length - minPlayers]; //- 5

				data[i].votes = this.votes;
				data[i].voteHistory = this.voteHistory;
				data[i].hammer = this.hammer;
				data[i].winner = this.winner;

				data[i].gameplayMessage = this.gameplayMessage;

				data[i].spectator = false;


				//if game is finished, reveal everything including roles
				if (this.phase === "finished") {
					data[i].see.spies = this.getAllSpies();
					data[i].see.roles = this.getRevealedRoles();
					data[i].see.playerShot = this.playerShot;
				}
			}
			return data;
		}
		else{
			return "Game hasn't started";
		}
		
	};

	this.playerReady = function (username) {
		var index = getIndexFromUsername(this.playersYetToReady, username);
		this.playersYetToReady.splice(index, 1);

		if (this.playersYetToReady.length === 0 && this.canJoin === false) {
			if (this.startGame(this.options) === true) {
				return true;
			}
			else {
				return false;
			}
		}
		else {
			return false;
		}
	}

	this.playerNotReady = function (username) {
		this.playersYetToReady = [];
		this.canJoin = true;
		return username;
	}

	this.hostTryStartGame = function (options) {
		if (this.canJoin === true) {
			//check before starting
			if (this.sockets.length < minPlayers) {
				//NEED AT LEAST FIVE PLAYERS, SHOW ERROR MESSAGE BACK
				console.log("Not enough players.");
				this.sockets[0].emit("danger-alert", "Minimum 5 players to start. ")
				return false;
			} else if (this.gameStarted === true) {
				console.log("Game already started!");
				return false;
			}

			//makes it so that others cannot join the room anymore
			this.canJoin = false;

			//.slice to clone
			this.playersYetToReady = this.sockets.slice();
			this.options = options;

			var rolesInStr = getRolesInStr(options);

			for (var i = 0; i < this.sockets.length; i++) {
				this.sockets[i].emit("game-starting", rolesInStr);
			}
		}

	}

	//start game
	this.startGame = function (options) {
		this.startGameTime = new Date();


		//make game started after the checks for game already started
		this.gameStarted = true;

		var rolesAssignment = generateAssignmentOrders(this.sockets.length);

		//shuffle the players around. Make sure to redistribute this room player data in sockets.
		for(var i = 0; i < this.sockets.length; i++){
			shuffledPlayerAssignments[i] = i;
		}
		shuffledPlayerAssignments = shuffle(shuffledPlayerAssignments);

		var tempSockets = [];
		//create temp sockets
		for(var i = 0; i < this.sockets.length; i++){
			tempSockets[i] = this.sockets[i];
		}

		//assign the shuffled sockets
		for(var i = 0; i < this.sockets.length; i++){
			this.sockets[i] = tempSockets[shuffledPlayerAssignments[i]];
		}

		


		//Now we initialise roles
		for (var i = 0; i < this.sockets.length; i++) {
			this.playersInGame[i] = {};
			//assign them the sockets but with shuffled. 
			this.playersInGame[i].username = this.sockets[i].request.user.username;
			this.playersInGame[i].socketId = this.sockets[i].id;

			//set the role to be from the roles array with index of the value
			//of the rolesAssignment which has been shuffled
			this.playersInGame[i].alliance = alliances[rolesAssignment[i]];
			// this.playersInGame[i].role = roles[rolesAssignment[i]];
		}


		//shuffle


		//give roles to the players according to their alliances
		//Get roles:
		this.resRoles = [];
		this.spyRoles = [];
		if (options.merlinassassin === true) { this.resRoles.push("Merlin"); this.spyRoles.push("Assassin"); console.log("added merlin assassin"); }
		if (options.percival === true) { this.resRoles.push("Percival"); console.log("Added percy"); }
		if (options.morgana === true) { this.spyRoles.push("Morgana"); console.log("Added morgana"); }
		if (options.mordred === true) { this.spyRoles.push("Mordred"); console.log("added mordred"); }
		if (options.oberon === true) { this.spyRoles.push("Oberon"); console.log("added oberon"); }
		if (options.lady === true) {
			this.lady = getRandomInt(0, this.sockets.length);
			this.ladyablePeople = [];
			for (var i = 0; i < this.sockets.length; i++) {
				this.ladyablePeople[i] = true;
			}
			this.ladyablePeople[this.lady] = false;
		}

		var resPlayers = [];
		var spyPlayers = [];

		this.resistanceUsernames = [];
		this.spyUsernames = [];
		for (var i = 0; i < this.sockets.length; i++) {
			if (this.playersInGame[i].alliance === "Resistance") { resPlayers.push(i); this.resistanceUsernames.push(getUsernameFromIndex(i, this.playersInGame));}
			else if (this.playersInGame[i].alliance === "Spy") { spyPlayers.push(i); this.spyUsernames.push(getUsernameFromIndex(i, this.playersInGame));}
		}

		//for the res roles:
		rolesAssignment = generateAssignmentOrders(resPlayers.length);
		for (var i = 0; i < rolesAssignment.length; i++) {
			this.playersInGame[resPlayers[i]].role = this.resRoles[rolesAssignment[i]];
			// console.log("res role: " + resRoles[rolesAssignment[i]]);
		}

		//for the spy roles:
		rolesAssignment = generateAssignmentOrders(spyPlayers.length);
		for (var i = 0; i < rolesAssignment.length; i++) {
			this.playersInGame[spyPlayers[i]].role = this.spyRoles[rolesAssignment[i]];
			// console.log("spy role: " + spyRoles[rolesAssignment[i]]);
		}


		//for those players with no role, set their role to their alliance
		for (var i = 0; i < this.playersInGame.length; i++) {
			// console.log(this.playersInGame[i].role);
			if (this.playersInGame[i].role === undefined) {
				this.playersInGame[i].role = this.playersInGame[i].alliance;
				// console.log("Overwrite role as alliance for player: " + this.playersInGame[i].username);
			}
		}


		//prepare the data for each person to see
		for (var i = 0; i < this.playersInGame.length; i++) {

			//set up the see object.
			this.playersInGame[i].see = {};
			this.playersInGame[i].see.spies = [];
			this.playersInGame[i].see.merlins = [];

			//give the respective role their data/info
			if (this.playersInGame[i].role === "Merlin") {
				this.playersInGame[i].see.spies = this.getSpies("Merlin");
			}
			else if (this.playersInGame[i].role === "Percival") {
				this.playersInGame[i].see.merlins = this.getMerlins();
			}
			else if (this.playersInGame[i].role === "Morgana") {
				this.playersInGame[i].see.spies = this.getSpies("Morgana");
			}
			else if (this.playersInGame[i].role === "Assassin") {
				this.playersInGame[i].see.spies = this.getSpies("Assassin");
			}
			else if (this.playersInGame[i].role === "Spy") {
				this.playersInGame[i].see.spies = this.getSpies("Spy");
			}
			else if (this.playersInGame[i].role === "Mordred") {
				this.playersInGame[i].see.spies = this.getSpies("Mordred");
			}
			else if (this.playersInGame[i].role === "Oberon") {
				this.playersInGame[i].see.spies = this.getSpies("Oberon");
			}
			else if (this.playersInGame[i].role === "Resistance") {

			}
		}

		//set game start parameters
		//get a random starting team leader
		this.teamLeader = getRandomInt(0, this.sockets.length);
		this.hammer = ((this.teamLeader - 5 + 1 + this.sockets.length) % this.sockets.length);

		this.missionNum = 1;
		this.pickNum = 1;
		// this.missionHistory = ["succeeded", "failed", "succeeded"];
		this.missionHistory = [];

		var str = "Game started with: ";
		//add res roles: 
		for (var i = 0; i < this.resRoles.length; i++) {
			str += (this.resRoles[i] + ", ");
		}
		for (var i = 0; i < this.spyRoles.length; i++) {
			str += (this.spyRoles[i] + ", ");
		}
		if (options.lady === true) {
			str += "Lady of the Lake."
		}

		// this.gameplayMessage = str;
		sendText(this.sockets, str, "gameplay-text");


		//seed the starting data into the VH
		for (var i = 0; i < this.sockets.length; i++) {
			this.voteHistory[this.sockets[i].request.user.username] = [];
		}

		return true;
	};

	this.getAllSpies = function () {
		if (this.gameStarted === true) {
			var array = [];
			for (var i = 0; i < this.playersInGame.length; i++) {
				if (this.playersInGame[i].alliance === "Spy") {
					array.push(this.playersInGame[i].username);
				}
			}
			return array;
		}
		else {
			return false;
		}
	}

	this.getSpies = function (roleRequesting) {
		if (this.gameStarted === true) {
			var array = [];

			//if oberon is requesting data, give it only him/herself's username
			if (roleRequesting === "Oberon") {
				for (var i = 0; i < this.playersInGame.length; i++) {
					if (this.playersInGame[i].role === "Oberon") {
						array.push(this.playersInGame[i].username);
						return array;
					}
				}
			}

			for (var i = 0; i < this.playersInGame.length; i++) {
				//NOTE: exclude mordred to merlin!
				if (this.playersInGame[i].alliance === "Spy") {
					if (this.playersInGame[i].role === "Mordred" && roleRequesting === "Merlin") {
						//don't add mordred for merlin to see
						//but do add it for any other spies.
					}
					else if (this.playersInGame[i].role === "Oberon" && roleRequesting !== "Merlin") {
						//Don't add oberon for any other spies,
						//but do add it for merlin (merlin can see oberon)
					}
					else {
						//add the spy
						array.push(this.playersInGame[i].username);
					}
				}
			}

			return array;
		} else {
			return false;
		}
	}

	this.getMerlins = function () {
		if (this.gameStarted === true) {
			var array = [];
			for (var i = 0; i < this.playersInGame.length; i++) {
				if (this.playersInGame[i].role === "Merlin" || this.playersInGame[i].role === "Morgana") {
					array.push(this.playersInGame[i].username);
				}
			}
			return array;
		} else {
			return false;
		}
	}

	this.getRevealedRoles = function () {
		if (this.gameStarted === true && this.phase === "finished") {
			var array = [];
			for (var i = 0; i < this.playersInGame.length; i++) {
				array.push(this.playersInGame[i].role);
			}
			return array;
		} else {
			return false;
		}
	}

	this.playerJoinRoom = function (socket) {
		//only add them to spectators if they are not part of the game already.
		var stringOfUsernames = [];

		//creating the string of usernames
		for(var i = 0; i < this.sockets.length; i++){
			stringOfUsernames.push(this.sockets[i].request.user.username);
		}


		if (stringOfUsernames.indexOf(socket.request.user.username) === -1) {
			console.log("Spectator added!");
			this.socketsOfSpectators.push(socket);
		}

		this.playersInRoom.push(socket);

		//get a list of usernames in the game
		//because if a player had left and came back into the room
		//we want to re-update their data they see
		var usernames = this.getUsernamesInGame();

		console.log("usernames: " + usernames);
		console.log("Socket uesrname: " + socket.request.user.username);
		//if the player joining is already part of the game
		var index = usernames.indexOf(socket.request.user.username);
		if (index !== -1) {
			//this.sockets.push(socket);

			console.log("Old socket: " + this.sockets[usernames.indexOf(socket.request.user.username)].request.user.username + ", " + this.sockets[usernames.indexOf(socket.request.user.username)].id);

			this.sockets[index].id = socket.id;
			this.playersInGame[index].socketId = socket.id;

			console.log("New socket: " + this.sockets[usernames.indexOf(socket.request.user.username)].request.user.username + ", " + this.sockets[usernames.indexOf(socket.request.user.username)].id);

			console.log("Player has refreshed their page, been given a new socket ID. That new ID has been updated");
			return false;
		}
	}

	this.playerJoinGame = function (socket) {
		// If they have not been kicked before
		if (this.kickedPlayers[socket.request.user.username] === true) {
			socket.emit("danger-alert", "You have been banned from this room. You can not join.");
			return false;
		}

		//when game hasnt started yet, add the person to the players in game
		//cap of 10 players in the game at once.
		if (this.gameStarted === false && this.sockets.length < 10 && this.canJoin === true) {
			this.sockets.push(socket);
			//also remove them from the list of socketsOfSpectators
			var i = this.socketsOfSpectators.indexOf(socket);
			this.socketsOfSpectators.splice(i, 1);

			return true;
		}
		else {
			console.log("Game has already started! Or maximum number of players");
			return false;
		}
	};


	//when a player leaves before game starts
	this.playerLeaveRoom = function (socket) {
		//remove from players in room
		this.playersInRoom.splice(this.playersInRoom.indexOf(socket), 1);

		if (this.playersInRoom.length === 0) {
			console.log("Room: " + this.roomId + " is empty, destroying...");
			this.destroyRoom = true;
		}


		if (this.gameStarted === false) {
			//get rid of their socket
			var i = this.sockets.indexOf(socket);
			if (i !== -1) {
				this.sockets.splice(i, 1);
			}
			if (this.sockets[0]) {
				this.host = this.sockets[0].request.user.username;
			}

			//also get rid of it in the socketsOfSpectators list
			var i = this.socketsOfSpectators.indexOf(socket);
			if (i !== -1) {
				this.socketsOfSpectators.splice(i, 1);
				console.log("Spectator left, killed their spec socket");
			}

			return true;
		}
		else {
			console.log("Player left mid-game.");
			return false;
		}


	};

	this.toDestroyRoom = function () {
		return this.destroyRoom;
	}

	this.getPlayers = function () {

		var array = [];

		for (var i = 0; i < this.sockets.length; i++) {
			var isClaiming = this.claimingPlayers[this.sockets[i].request.user.username];

			array[i] = {
				username: this.sockets[i].request.user.username,
				avatarImgRes: this.sockets[i].request.user.avatarImgRes,
				avatarImgSpy: this.sockets[i].request.user.avatarImgSpy,
				claim: isClaiming
			}

			//give the host the teamLeader star
			if (array[i].username === this.host) {
				array[i].teamLeader = true;
			}
		}
		
		return array;
	};

	this.getUsernamesInGame = function () {
		if (this.gameStarted === true) {
			var array = [];
			for (var i = 0; i < this.sockets.length; i++) {
				array[i] = this.sockets[i].request.user.username;
			}
			return array;
		}
		else {
			return [];
		}
	}

	//This code stays only in the server,
	//individual roles will be distributed individually.
	this.getPlayerRoles = function () {
		if (this.gameStarted === true) {
			console.log("GET PLAYER ROLES TRUE");
			console.log("Players in game: " + playerInGame);
			return this.playersInGame;
		}
		else {
			console.log("GET PLAYER ROLES false");
			console.log("Game hasn't started yet");
			return false;
		}
	}

	this.getSockets = function () {
		return this.sockets;
	};

	this.getHostUsername = function () {
		return this.host;
	};

	this.getStatus = function () {
		if (this.finished === true) {
			return "Finished";
		} else if (this.gameStarted === true) {
			return "Game in progress";
		} else {
			return "Waiting";
		}
	}

	this.getRoomId = function () {
		return this.roomId;
	}

	this.getNumOfPlayersInside = function () {
		return this.sockets.length;
	}


	this.getSocketsOfSpectators = function () {
		return this.socketsOfSpectators;
	}

	this.kickPlayer = function (username, socket) {
		if (this.gameStarted === false) {
			if (this.host === socket.request.user.username) {
				// Get their socket
				var kickedPlayerSocket = this.sockets[getIndexFromUsername(this.sockets, username)];
				// Remove from game
				this.sockets.splice(getIndexFromUsername(this.sockets, username), 1);
				// Add to the list of spectators
				this.socketsOfSpectators.push(kickedPlayerSocket);
				console.log("Kicked player: " + username);

				sendText(this.playersInRoom, "Player " + username + " has been kicked by the host.", "server-text");

				// Ban them from this room
				this.kickedPlayers[username] = true;
			}
		}
		// console.log("Cant kick, game started");
	}

	this.getGameStarted = function(){
		return this.gameStarted;
	}

	this.getUsernamesOfSpectators = function() {

		var arrayToReturn = [];

		for(var i = 0; i < socketsOfSpectators.length; i++){
			arrayToReturn[i] = socketsOfSpectators[i].request.user.username;
		}

		return arrayToReturn;
	}

	this.claim = function(socket){
		//if the person is already claiming
		if(socket.request.user.username in this.claimingPlayers){
			delete this.claimingPlayers[socket.request.user.username];
		}
		else{
			this.claimingPlayers[socket.request.user.username] = true;
		}
	}
};


// Functions

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

function getIndexFromUsername(sockets, username) {
	for (var i = 0; i < sockets.length; i++) {
		if (username === sockets[i].request.user.username) {
			return i;
		}
	}
}

function getUsernameFromIndex(index, playersInGame) {
	return playersInGame[index].username;
}

function calcMissionVotes(votes, requiresTwoFails) {
	//note we may not have all the votes from every person
	//e.g. may look like "fail", "undef.", "success"
	numOfPlayers = votes.length;

	var countSucceed = 0;
	var countFail = 0;

	var outcome;

	for (var i = 0; i < numOfPlayers; i++) {
		if (votes[i] === "succeed") {
			console.log("succeed");
			countSucceed++;
		}
		else if (votes[i] === "fail") {
			console.log("fail");
			countFail++;
		}
		else {
			console.log("Bad vote: " + votes[i]);
		}
	}

	//calcuate the outcome
	if (countFail === 0) {
		outcome = "succeeded";
	}
	else if (countFail === 1 && requiresTwoFails === true) {
		outcome = "succeeded";
	}
	else {
		outcome = "failed";
	}

	return outcome;
}

function calcVotes(votes) {
	var numOfPlayers = votes.length;
	var countApp = 0;
	var countRej = 0;
	var outcome;

	for (var i = 0; i < numOfPlayers; i++) {
		if (votes[i] === "approve") {
			console.log("app");
			countApp++;
		}
		else if (votes[i] === "reject") {
			console.log("rej");
			countRej++;
		}
		else {
			console.log("Bad vote: " + votes[i]);
		}
	}

	//calcuate the outcome
	if (countApp > countRej) {
		outcome = "approved";
	}
	else {
		outcome = "rejected";
	}

	return outcome;
}

function getStrApprovedRejectedPlayers(votes, playersInGame) {
	var approvedUsernames = "";
	var rejectedUsernames = "";

	for (var i = 0; i < votes.length; i++) {

		if (votes[i] === "approve") {
			approvedUsernames = approvedUsernames + getUsernameFromIndex(i, playersInGame) + ", ";
		}
		else if (votes[i] === "reject") {
			rejectedUsernames = rejectedUsernames + getUsernameFromIndex(i, playersInGame) + ", ";
		}
		else {
			console.log("ERROR! Unknown vote: " + gameData.votes[i]);
		}
	}
	// Disabled approve rejected people.
	// var str = "<p>Approved: " + approvedUsernames + "</p> <p>Rejected: " + rejectedUsernames + "</p>"
	var str = "";

	return str;
}

function generateAssignmentOrders(num) {
	var rolesAssignment = [];

	//create the starting array for role assignment
	for (var i = 0; i < num; i++) {
		rolesAssignment[i] = i;
	}

	//shuffle
	rolesAssignment = shuffle(rolesAssignment);
	// console.log(rolesAssignment);

	return rolesAssignment;
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

function getRolesInStr(options) {

	var str = "";

	if (options.merlinassassin === true) { str += "Merlin, Assassin, " }
	if (options.percival === true) { str += "Percival, "; }
	if (options.morgana === true) { str += "Morgana, "; }
	if (options.mordred === true) { str += "Mordred, "; }
	if (options.oberon === true) { str += "Oberon, "; }
	if (options.lady === true) { str += "Lady of the Lake, "; }

	return str;
}


function sendText(sockets, incString, stringType) {
	data = {
		message: incString,
		classStr: stringType
	};
	for (var i = 0; i < sockets.length; i++) {
		sockets[i].emit("roomChatToClient", data);
	}
}