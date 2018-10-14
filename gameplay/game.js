var util = require("util");
var Room = require("./room");
var PlayersReadyNotReady = require("./playersReadyNotReady");

var usernamesIndexes = require("../myFunctions/usernamesIndexes");


var mongoose = require("mongoose");
var User = require("../models/user");
var GameRecord = require("../models/gameRecord");

mongoose.connect("mongodb://localhost/TheNewResistanceUsers");


var avalonRolesIndex = require("./avalon/index");


//********************************
//CONSTANTS
//********************************
var minPlayers = 5;
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
];

var numPlayersOnMission = [
	["2", "3", "2", "3", "3"],
	["2", "3", "4", "3", "4"],
	["2", "3", "3", "4*", "4"],
	["3", "4", "4", "5*", "5"],
	["3", "4", "4", "5*", "5"],
	["3", "4", "4", "5*", "5"],
];




function Game (host_, roomId_, io_, maxNumPlayers_, newRoomPassword_){
	//Get the Room properties
	Room.call(this, host_, roomId_, io_, maxNumPlayers_, newRoomPassword_);
	PlayersReadyNotReady.call(this, minPlayers);

	var thisRoom = this;

	this.avalonRolesObj = new avalonRolesIndex;
	this.avalonRoles = this.avalonRolesObj.getRoles(thisRoom);
	// console.log(this.avalonRoles);

	/*
		Handle joining:
			- If game hasn't started, join like usual
			- If game has started, check if they are a player
				- If they are player, give them data
				- If they are not a player, give them spec data
	*/

	/*
		Phases go like this:
			Note: Cards run should be run every time phase changes

			Always run between phases:
				- Card
				- Role specials (e.g. assassination)

			Start from phase 1:
			1) Player picking.
			2) Receive interactions for team votes.
				- If approved, go to phase 3.
				- If rejected, go to phase 1.
			3) Receive interactions for mission votes.
				- If game finished, go to phase 4.
				- If game not finished, go to phase 1.
			4) Game finished



			Table:
				Phase	|	String
				1			"pickingTeam"
				2			"votingTeam"
				3			"votingMission"
				4			"finished"

			Misc Phases:
				Phase	|	String
							"lady"
							"assassination"

	*/


	/* 
		Receive interactions depending on current state

	*/

	// Game variables
	this.gameStarted 					= false;
	this.finished 						= false;

	this.phase					 		= "picking";

	this.playersInGame 					= [];

	this.teamLeader 					= 0;
	this.hammer 						= 0;
	this.missionNum 					= 0;
	this.pickNum 						= 0;
	this.missionHistory 				= [];
	this.proposedTeam 					= [];
	this.lastProposedTeam 				= [];
	this.teamVotes 						= [];
	this.missionVotes 					= [];

	this.voteHistory 					= {};

	// Game misc variables
	this.winner							= "";
	this.moreThanOneFailMissions 		= [];
	this.options 						= undefined;

	// Room variables
	this.destroyRoom 					= false;
	
	// Room misc variables
	this.chatHistory 					= []; // Here because chatHistory records after game starts

}

//Game object inherits all the functions and stuff from Room
Game.prototype = Object.create(Room.prototype);
Object.assign(Game.prototype, PlayersReadyNotReady.prototype);


//------------------------------------------------
// METHOD OVERRIDES ------------------------------
//------------------------------------------------
Game.prototype.playerJoinRoom = function (socket, inputPassword) {
	console.log("Game.js file should print first");

	if(this.gameStarted === true){

		//if the new socket is a player, add them to the sockets of players
		for(var i = 0; i < this.playersInGame.length; i++){
			if(this.playersInGame[i].username === socket.request.user.username){
				this.socketsOfPlayers.splice(i, 0, socket);

				this.playersInGame[i].request = socket.request;
				
				break;
			}
		}
		//sends to players and specs
		this.distributeGameData();
	}

	Room.prototype.playerJoinRoom.call(this, socket, inputPassword);
	this.updateRoomPlayers();		
};

Game.prototype.playerSitDown = function(socket){
	// If the game has started 
	if(this.gameStarted === true){
		socket.emit("danger-alert", "Game has already started.");
		return;
	}
	// If the ready/not ready phase is ongoing
	else if(this.canJoin === false){
		socket.emit("danger-alert", "The game is currently trying to start (ready/not ready phase). You can join if someone is not ready, or after 10 seconds has elapsed.");
		return;
	}

	Room.prototype.playerSitDown.call(this, socket);
}



// && this.gameStarted === false && this.canJoin === true


//start game
Game.prototype.startGame = function (options) {

	if(this.socketsOfPlayers.length < 5 || this.socketsOfPlayers.length > 10 || this.gamePlayerLeftDuringReady === true){
		this.canJoin = true;
		this.gamePlayerLeftDuringReady = false;
		return false;
	}
	this.startGameTime = new Date();


	//make game started after the checks for game already started
	this.gameStarted = true;

	var rolesAssignment = generateAssignmentOrders(this.socketsOfPlayers.length);

	var shuffledPlayerAssignments = [];
	//shuffle the players around. Make sure to redistribute this room player data in sockets.
	for(var i = 0; i < this.socketsOfPlayers.length; i++){
		shuffledPlayerAssignments[i] = i;
	}
	shuffledPlayerAssignments = shuffle(shuffledPlayerAssignments);

	var tempSockets = [];
	//create temp sockets
	for(var i = 0; i < this.socketsOfPlayers.length; i++){
		tempSockets[i] = this.socketsOfPlayers[i];
	}

	//assign the shuffled sockets
	for(var i = 0; i < this.socketsOfPlayers.length; i++){
		this.socketsOfPlayers[i] = tempSockets[shuffledPlayerAssignments[i]];
	}

	//Now we initialise roles
	for (var i = 0; i < this.socketsOfPlayers.length; i++) {
		this.playersInGame[i] = {};
		//assign them the sockets but with shuffled. 
		this.playersInGame[i].username = this.socketsOfPlayers[i].request.user.username;
		this.playersInGame[i].socketId = this.socketsOfPlayers[i].id;
		this.playersInGame[i].userId = this.socketsOfPlayers[i].request.user._id;

		this.playersInGame[i].request = this.socketsOfPlayers[i].request;

		//set the role to be from the roles array with index of the value
		//of the rolesAssignment which has been shuffled
		this.playersInGame[i].alliance = alliances[rolesAssignment[i]];
	}


	for(var key in this.avalonRoles){
		if(this.avalonRoles.hasOwnProperty(key)){
			console.log("Key: " + key);
		}
	}

	//Give roles to the players according to their alliances
	//Get roles:
	this.resRoles = [];
	this.spyRoles = [];

	// For every role we get given:
	for(var key in options){
		if(options.hasOwnProperty(key)){
			// If the role is selected in game: 
			if(options[key] === true){
				// If a role file exists for this
				if(this.avalonRoles.hasOwnProperty(key)){
					// If it is a res:
					if(this.avalonRoles[key].alliance === "Resistance"){
						this.resRoles.push(this.avalonRoles[key].role);
					}
					else if(this.avalonRoles[key].alliance === "Spy"){
						this.spyRoles.push(this.avalonRoles[key].role);
					}
					else{
						console.log("THIS SHOULD NOT HAPPEN! Invalid role file. Look in game.js file.");
					}
				}
				else{
					console.log("Warning: Client requested a role that doesn't exist -> " + key);
				}
			}
		}
	}

	var resPlayers = [];
	var spyPlayers = [];


	for (var i = 0; i < this.playersInGame.length; i++) {
		if (this.playersInGame[i].alliance === "Resistance") {
			resPlayers.push(i); 
		}
		else if (this.playersInGame[i].alliance === "Spy") {
			spyPlayers.push(i);
		}
	}

	// Assign the res roles randomly
	rolesAssignment = generateAssignmentOrders(resPlayers.length);
	for (var i = 0; i < rolesAssignment.length; i++) {
		this.playersInGame[resPlayers[i]].role = this.resRoles[rolesAssignment[i]];
		// console.log("res role: " + resRoles[rolesAssignment[i]]);
	}

	// Assign the spy roles randomly
	rolesAssignment = generateAssignmentOrders(spyPlayers.length);
	for (var i = 0; i < rolesAssignment.length; i++) {
		this.playersInGame[spyPlayers[i]].role = this.spyRoles[rolesAssignment[i]];
		// console.log("spy role: " + spyRoles[rolesAssignment[i]]);
	}


	//for those players with no role, set their role to their alliance (i.e. for Resistance VT and Spy VS)
	for (var i = 0; i < this.playersInGame.length; i++) {
		// console.log(this.playersInGame[i].role);
		if (this.playersInGame[i].role === undefined) {
			this.playersInGame[i].role = this.playersInGame[i].alliance;
			// console.log("Overwrite role as alliance for player: " + this.playersInGame[i].username);
		}
	}

	// Prepare the data for each person to see for the rest of the game.
	// The following data do not change as the game goes on.
	for (var i = 0; i < this.playersInGame.length; i++) {
		// Lowercase the role to give the file name
		let roleLower = this.playersInGame[i].role.toLowerCase();

		this.playersInGame[i].see = this.avalonRoles[roleLower].see();
	}

	//set game start parameters
	//get a random starting team leader
	this.teamLeader = getRandomInt(0, this.playersInGame.length);
	this.hammer = ((this.teamLeader - 5 + 1 + this.playersInGame.length) % this.playersInGame.length);

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

	// TODO: Need to add cards here!!!

	//remove the last , and replace with .
	str = str.slice(0, str.length - 2);
	str += ".";
	// this.gameplayMessage = str;
	this.sendText(this.allSockets, str, "gameplay-text");


	//seed the starting data into the VH
	for (var i = 0; i < this.playersInGame.length; i++) {
		this.voteHistory[this.playersInGame[i].request.user.username] = [];
	}

	this.distributeGameData();
	return true;
};


Game.prototype.distributeGameData = function(){
	//distribute roles to each player

	this.updateRoomPlayers();

	if(this.gameStarted === true){
		var gameData = this.getGameData();
		for(var i = 0; i < this.playersInGame.length; i++){
			var index = usernamesIndexes.getIndexFromUsername(this.socketsOfPlayers, this.playersInGame[i].request.user.username);

			//need to go through all sockets, but only send to the socket of players in game
			if(this.socketsOfPlayers[index]){
				this.socketsOfPlayers[index].emit("game-data", gameData[i])

				// console.log("Sent to player: " + this.playersInGame[i].request.user.username + " role " + gameData[i].role);
			}
		}
	
		var gameDataForSpectators = this.getGameDataForSpectators();

		var sockOfSpecs = this.getSocketsOfSpectators();
		sockOfSpecs.forEach(function(sock){
			sock.emit("game-data", gameDataForSpectators);
			// console.log("(for loop) Sent to spectator: " + sock.request.user.username);
		});
	}
};

Game.prototype.getGameData = function () {
	if(this.gameStarted == true){
		var data = {};

		var playerRoles = this.playersInGame;

		//set up the object first, because we cannot pass an array through
		//socket.io
		for (var i = 0; i < playerRoles.length; i++) {
			// Player specific data
			data[i] = {
				alliance: playerRoles[i].alliance,
				role: playerRoles[i].role,
				see: playerRoles[i].see,
				username: playerRoles[i].username,
				socketId: playerRoles[i].socketId
			}

			//add on these common variables:
			data[i].statusMessage 			= getStatusMessage();
			data[i].missionNum 				= this.missionNum;
			data[i].missionHistory 			= this.missionHistory;
			data[i].pickNum 				= this.pickNum;
			data[i].teamLeader 				= this.teamLeader;
			data[i].hammer 					= this.hammer;

			data[i].playersYetToVote 		= this.playersYetToVote;
			data[i].phase 					= this.phase;
			data[i].proposedTeam 			= this.proposedTeam;

			data[i].numPlayersOnMission 	= numPlayersOnMission[playerRoles.length - minPlayers]; //- 5

			data[i].votes 					= this.votes;
			data[i].voteHistory 			= this.voteHistory;
			data[i].hammer 					= this.hammer;
			data[i].winner 					= this.winner;

			data[i].gameplayMessage 		= this.gameplayMessage;

			data[i].spectator 				= false;
			data[i].gamePlayersInRoom 		= getUsernamesOfPlayersInRoom(this);

			data[i].roomId 					= this.roomId;

			//if game is finished, reveal everything including roles
			if (this.phase === "finished") {
				data[i].see.spies = this.getAllSpies(this);
				data[i].see.roles = this.getRevealedRoles(this);
				data[i].proposedTeam = this.lastProposedTeam;
			}
			else if (this.phase === "assassination") {
				data[i].proposedTeam = this.lastProposedTeam;
			}
		}
		return data;
	}
	else{
		return "Game hasn't started";
	}
	
};


Game.prototype.getGameDataForSpectators = function () {
	// return false;
	var playerRoles = this.playersInGame;

	//set up the spectator data object
	var data = {};

	data.see 							= {};
	data.see.spies 						= [];
	data.see.merlins 					= [];

	data.statusMessage 					= getStatusMessage();
	data.missionNum 					= this.missionNum;
	data.missionHistory 				= this.missionHistory;
	data.pickNum 						= this.pickNum;
	data.teamLeader 					= this.teamLeader;
	data.hammer 						= this.hammer;

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
	data.gamePlayersInRoom = getUsernamesOfPlayersInRoom(this);	

	data.roomId = this.roomId;
	

	//if game is finished, reveal everything including roles
	if (this.phase === "finished") {
		data.see.spies = this.getAllSpies(this);
		data.see.roles = this.getRevealedRoles(this);
		data.proposedTeam = this.lastProposedTeam;
	}
	else if (this.phase === "assassination") {
		data.proposedTeam = this.lastProposedTeam;
	}

	return data;
}


//Misc game room functions
Game.prototype.addToChatHistory = function(data){
	//FOR TESTING
	// this.avalonRoles.merlin.test();
	// this.avalonRoles.percival.test();

	if(this.gameStarted === true){
		this.chatHistory.push(data);
	}
}

Game.prototype.getStatus = function () {
	if(this.frozen === true){
		return "Frozen";
	}
	else if (this.finished === true) {
		return "Finished";
	} 
	else if (this.gameStarted === true) {
		return "Game in progress";
	} 
	else {
		return "Waiting";
	}
}

// console.log((new Game).__proto__);

module.exports = Game;












// Helpful functions

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


function calcMissionVotes(votes, requiresTwoFails) {
	//note we may not have all the votes from every person
	//e.g. may look like "fail", "undef.", "success"
	numOfPlayers = votes.length;

	var countSucceed = 0;
	var countFail = 0;

	var outcome;

	for (var i = 0; i < numOfPlayers; i++) {
		if (votes[i] === "succeed") {
			// console.log("succeed");
			countSucceed++;
		}
		else if (votes[i] === "fail") {
			// console.log("fail");
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
			approvedUsernames = approvedUsernames + getUsernameFromIndex(playersInGame, i) + ", ";
		}
		else if (votes[i] === "reject") {
			rejectedUsernames = rejectedUsernames + getUsernameFromIndex(playersInGame, i) + ", ";
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

	if (options.merlin === true) { str += "Merlin, "; }
	if (options.assassin === true) { str += "Assassin, "; }
	if (options.percival === true) { str += "Percival, "; }
	if (options.morgana === true) { str += "Morgana, "; }
	if (options.mordred === true) { str += "Mordred, "; }
	if (options.oberon === true) { str += "Oberon, "; }
	if (options.lady === true) { str += "Lady of the Lake, "; }

	//remove the last , and replace with .
	str = str.slice(0, str.length - 2);
	str += ".";

	return str;
}

function getAllSpies(thisRoom) {
	if (thisRoom.gameStarted === true) {
		var array = [];
		for (var i = 0; i < thisRoom.playersInGame.length; i++) {
			if (thisRoom.playersInGame[i].alliance === "Spy") {
				array.push(thisRoom.playersInGame[i].username);
			}
		}
		return array;
	}
	else {
		return false;
	}
}

function getRevealedRoles(thisRoom) {
	if (thisRoom.gameStarted === true && thisRoom.phase === "finished") {
		var array = [];
		for (var i = 0; i < thisRoom.playersInGame.length; i++) {
			array.push(thisRoom.playersInGame[i].role);
		}
		return array;
	} else {
		return false;
	}
}

function getUsernamesOfPlayersInRoom(thisRoom) {
	if(thisRoom.gameStarted === true){
		var array = [];
		for(var i = 0; i < thisRoom.socketsOfPlayers.length; i++){
			array.push(thisRoom.socketsOfPlayers[i].request.user.username);
		}
		return array;
	}
	else{
		return [];
	}
}

function getStatusMessage(){
	return "Get status message, TODO, incomplete";
}







