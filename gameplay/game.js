var util = require("util");
var Room = require("./room");
var PlayersReadyNotReady = require("./playersReadyNotReady");

var usernamesIndexes = require("../myFunctions/usernamesIndexes");


var mongoose = require("mongoose");
var User = require("../models/user");
var GameRecord = require("../models/gameRecord");

mongoose.connect("mongodb://localhost/TheNewResistanceUsers");


var avalonRolesIndex = require("./avalon/indexRoles");
var avalonCardsIndex = require("./avalon/indexCards");


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

	this.avalonRoles = (new avalonRolesIndex).getRoles(thisRoom);
	this.avalonCards = (new avalonCardsIndex).getCards(thisRoom);

	// this.avalonRoles = this.avalonRolesObj.getRoles(thisRoom);
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

	this.phase					 		= "pickingTeam";

	this.playersInGame 					= [];
	this.playerUsernamesInGame			= [];

	this.roleKeysInPlay					= [];
	this.cardKeysInPlay					= [];

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
};

Game.prototype.playerStandUp = function(socket){
	//If the ready/not ready phase is ongoing
	if(this.canJoin === false){
		socket.emit("danger-alert", "The game is currently trying to start (ready/not ready phase). You cannot stand up now.");
		return;
	}
	// If the game has started
	else if(this.gameStarted === true){
		socket.emit("danger-alert", "The game has started... You shouldn't be able to see that stand up button!");
		return;
	}

	Room.prototype.playerStandUp.call(this, socket);
};

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

		this.playerUsernamesInGame.push(this.socketsOfPlayers[i].request.user.username);
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
					this.roleKeysInPlay.push(key)
				}

				// If a card file exists for this
				else if(this.avalonCards.hasOwnProperty(key)){
					this.cardKeysInPlay.push(key);
					//Initialise the card
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


Game.prototype.gameMove = function (socket, data) {

	//RUN SPECIAL ROLE AND CARD CHECKS
	// .......................

	//************************************************************************************
	//************************************************************************************
	//************************************************************************************
	if(this.phase === "pickingTeam"){
		// If the person requesting is the host
		if(getIndexFromUsername(this.playersInGame, socket.request.user.username) === this.teamLeader){
			//Reset votes
			this.votes = [];

			var num = numPlayersOnMission[this.playersInGame.length - minPlayers][this.missionNum - 1];
			console.log("Num player for this mission : " + numPlayersMission);

			//In case the mission num is 4*, make it 4.
			if(num.length > 1){ num = parseInt(num[1]); }
			else{ num = parseInt(num); }
			
			//Check that the data is valid (i.e. includes only usernames of players)
			for(var i = 0; i < num; i++){
				// If the data doesn't have the right number of users
				// Or has an empty element
				if(!data[i]){
					return; 
				}
				if(this.playerUsernamesInGame.includes(data[i]) === false){
					return;
				}
			}

			//Continue if it passes the above check
			this.proposedTeam = data;
			//.slice to clone the array
			this.playersYetToVote = this.playerUsernamesInGame.slice();

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

			this.sendText(this.allSockets, str2, "gameplay-text");
			


			this.VHUpdateTeamPick();

			this.phase = "votingTeam";
		}
		else{
			console.log("User is not the team leader. Cannot pick.");
		}
	}
	//************************************************************************************
	//************************************************************************************
	//************************************************************************************
	else if(this.phase === "votingTeam"){
		// Get the index of the user who is trying to vote
		var i = this.playersYetToVote.indexOf(socket.request.user.username);

		//Check the data is valid (if it is not a "yes" or a "no")
		if( !(data === "yes" || data === "no") ){
			return;
		}

		// If they haven't voted yet
		if(i !== -1){
			if(data === "yes"){
				this.votes[getIndexFromUsername(this.playersInGame, socket.request.user.username)] = "yes";
			}
			else if(data === "no"){
				this.votes[getIndexFromUsername(this.playersInGame, socket.request.user.username)] = "no";
			}
			else {
				console.log("ERROR! This should definitely not happen. Game.js votingTeam.");
			}

			//remove the player from players yet to vote
			this.playersYetToVote.splice(i, 1);

			// If we have all of our votes, proceed onward
			if(this.playersYetToVote.length === 0){
				var outcome = calcVotes(this.votes);

				if(outcome === "yes"){
					this.phase === "missionVoting";
					this.playersYetToVote = this.proposedTeam.slice();

					var str = "Mission " + this.missionNum + "." + this.pickNum + " was approved." + getStrApprovedRejectedPlayers(this.votes, this.playersInGame);
					this.sendText(this.allSockets, str, "gameplay-text");
				}
				//Hammer reject
				else if(outcome === "no" && this.pickNum >= 5){
					this.missionHistory[this.missionHistory.length] = "failed";

					this.howWasWon = "Hammer rejected.";
					this.finishGame("Spy");
				}
				else if (outcome === "no") {
					this.proposedTeam = [];
					this.phase = "pickingTeam";

					var str = "Mission " + this.missionNum + "." + this.pickNum + " was rejected." + getStrApprovedRejectedPlayers(this.votes, this.playersInGame);
					this.sendText(this.allSockets, str, "gameplay-text");

					this.incrementTeamLeader();
				}
				this.VHUpdateTeamVotes();
			}

			this.distributeGameData();
		}
	}
	//************************************************************************************
	//************************************************************************************
	//************************************************************************************
	else if(this.phase === "votingMission"){
		var i = this.playersYetToVote.indexOf(socket.request.user.username);

		//if this vote is coming from someone who hasn't voted yet
		if (i !== -1) {
			if (voteStr === "yes") {
				this.missionVotes[getIndexFromUsername(this.playersInGame, socket.request.user.username)] = "succeed";
				// console.log("received succeed from " + socket.request.user.username);
			}
			else if (voteStr === "no") {
				this.missionVotes[getIndexFromUsername(this.playersInGame, socket.request.user.username)] = "fail";
				// console.log("received fail from " + socket.request.user.username);
			}
			else {
				console.log("ERROR! Expected yes or no (success/fail), got: " + voteStr);
			}
			//remove the player from players yet to vote
			this.playersYetToVote.splice(i, 1);
		}
		else {
			console.log("Player " + socket.request.user.username + " has already voted or is not in the game");
		}


		// If we have all the votes in
		if (this.playersYetToVote.length === 0) {

			var outcome = calcMissionVotes(this.missionVotes);
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
					this.sendText(this.allSockets, "Mission " + this.missionNum + " succeeded.", "gameplay-text-blue");
				}
				else {
					this.sendText(this.allSockets, "Mission " + this.missionNum + " succeeded, but with " + numOfVotedFails + " fail.", "gameplay-text-blue");
				}
			}
			else if (outcome === "failed") {
				//get number of fails
				var numOfVotedFails = countFails(this.missionVotes);

				if(numOfVotedFails > 1){
					this.moreThanOneFailMissions[this.missionNum] = true;
				}

				if (numOfVotedFails === 1) {	
					this.sendText(this.allSockets, "Mission " + this.missionNum + " failed with " + numOfVotedFails + " fail.", "gameplay-text-red");
				}
				else {
					this.sendText(this.allSockets, "Mission " + this.missionNum + " failed with " + numOfVotedFails + " fails.", "gameplay-text-red");
				}
			}

			
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


			//game over if more than 3 fails or successes
			if (numOfFails >= 3) {
				this.winner = "Spy";
				this.finishGame("Spy");
			}
			else if (numOfSucceeds >= 3) {
				this.winner = "Resistance";
				this.finishGame("Resistance");
			}
			// If the game goes on
			else{
				this.missionNum++;
				this.pickNum = 1;
				this.teamLeader--;
				if (this.teamLeader < 0) {
					this.teamLeader = this.socketsOfPlayers.length - 1;
				}
				this.hammer = ((this.teamLeader - 5 + 1 + this.playersInGame.length) % this.playersInGame.length);
				this.phase = "picking";	
			}
		}
	}
	//************************************************************************************
	//************************************************************************************
	//************************************************************************************
	else if(this.phase === "finished"){
		// Do nothing here?
	}




	//RUN SPECIAL ROLE AND CARD CHECKS
	// .......................

};

Game.prototype.incrementTeamLeader = function(){
	//move to next team Leader, and reset it back to the start if 
	//we go into negative numbers
	this.teamLeader--;
	if (this.teamLeader < 0) {
		this.teamLeader = this.playersInGame.length - 1;
	}
	this.pickNum++;
}



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



Game.prototype.finishGame = function(){
	this.phase === "finished";

	// RUN SPECIAL CARD/ROLE CHECKS (i.e. assassin)
	// TODO


	// If after the special card/role check the phase is
	// not finished now, then don't run the rest of the code below
	if(this.phase !== "finished"){
		return;
	}




	for(var key in this.allSockets){
		if(this.allSockets.hasOwnProperty(key)){
			this.allSockets[key].emit("gameEnded");
		}
	}

	//game clean up
	this.finished = true;

	if (this.winner === "spies") {
		// this.gameplayMessage = "The spies have won the game.";
		this.sendText(this.allSockets, "The spies have won the game.", "gameplay-text");
	}
	else if (this.winner === "resistance") {
		// this.gameplayMessage = "The resistance have won the game.";
		this.sendText(this.allSockets, "The resistance have won the game.", "gameplay-text");
	}

	this.distributeGameData();



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
		numberOfPlayers: this.playersInGame.length,
		howTheGameWasWon: this.howWasWon,
		roles: rolesCombined,

		missionHistory: this.missionHistory,
		voteHistory: this.voteHistory,
		playerRoles: playerRolesVar,

		ladyChain: this.ladyChain,
		whoAssassinShot: this.whoAssassinShot,

		moreThanOneFailMissions: this.moreThanOneFailMissions
	};

	GameRecord.create(objectToStore, function(err){
		if(err){
			console.log(err);
		}
		else{
			// console.log("Stored game data successfully.");
		}
	});

	//store player data:
	var timeFinished = new Date();
	var timeStarted = new Date(this.startGameTime);

	var gameDuration = new Date(timeFinished - timeStarted);


	var playersInGameVar = this.playersInGame;
	var winnerVar = this.winner;

	this.playersInGame.forEach(function(player){

		User.findById(player.userId).populate("modAction").populate("notifications").exec(function(err, foundUser){
			if(err){console.log(err);}
			else{
				if(foundUser){
					foundUser.totalTimePlayed = new Date(foundUser.totalTimePlayed.getTime() + gameDuration.getTime());
				
					//update individual player statistics
					foundUser.totalGamesPlayed += 1;

					if(winnerVar === player.alliance){
						foundUser.totalWins += 1;
						if(winnerVar === "Resistance"){
							foundUser.totalResWins += 1;
						}
					} else{
						//loss
						foundUser.totalLosses += 1;
						if(winnerVar === "Spy"){
							foundUser.totalResLosses += 1;
						}
					}

					//checks that the var exists
					if(!foundUser.winsLossesGameSizeBreakdown[playersInGameVar.length + "p"]){
						foundUser.winsLossesGameSizeBreakdown[playersInGameVar.length + "p"] = {
							wins: 0,
							losses: 0
						};
					}
					if(!foundUser.roleStats[playersInGameVar.length + "p"]){
						foundUser.roleStats[playersInGameVar.length + "p"] = {};
					}
					if(!foundUser.roleStats[playersInGameVar.length + "p"][player.role.toLowerCase()]){
						foundUser.roleStats[playersInGameVar.length + "p"][player.role.toLowerCase()] = {
							wins: 0,
							losses: 0
						};
					}


					if(winnerVar === player.alliance){
						//checks
						if(isNaN(foundUser.winsLossesGameSizeBreakdown[playersInGameVar.length + "p"].losses)){
							foundUser.winsLossesGameSizeBreakdown[playersInGameVar.length + "p"].wins = 0;
						}
						if(isNaN(foundUser.roleStats[playersInGameVar.length + "p"][player.role.toLowerCase()].wins)){
							foundUser.roleStats[playersInGameVar.length + "p"][player.role.toLowerCase()].wins = 0;
						}
						// console.log("=NaN?");
						// console.log(isNaN(foundUser.roleStats[playersInGameVar.length + "p"][player.role.toLowerCase()].wins));

						foundUser.winsLossesGameSizeBreakdown[playersInGameVar.length + "p"].wins += 1;
						foundUser.roleStats[playersInGameVar.length + "p"][player.role.toLowerCase()].wins += 1;
					}
					else{
						//checks
						if(isNaN(foundUser.winsLossesGameSizeBreakdown[playersInGameVar.length + "p"].losses)){
							foundUser.winsLossesGameSizeBreakdown[playersInGameVar.length + "p"].losses = 0;
						}
						if(isNaN(foundUser.roleStats[playersInGameVar.length + "p"][player.role.toLowerCase()].losses)){
							foundUser.roleStats[playersInGameVar.length + "p"][player.role.toLowerCase()].losses = 0;
						}

						foundUser.winsLossesGameSizeBreakdown[playersInGameVar.length + "p"].losses += 1;
						foundUser.roleStats[playersInGameVar.length + "p"][player.role.toLowerCase()].losses += 1;
					}
					// console.log("Rolestat for player");
					// console.log(foundUser.roleStats[playersInGameVar.length + "p"][player.role.toLowerCase()]);

					foundUser.markModified("winsLossesGameSizeBreakdown");
					foundUser.markModified("roleStats");
					
					foundUser.save();
					// console.log("SAVE SAVE");

				}
				
			}
		});
	});
}










// If entries don't exist for current missionNum and pickNum, create them
Game.prototype.VHCheckUndefined = function(){
	for (var i = 0; i < this.playersInGame.length; i++) {
		if (this.voteHistory[this.playersInGame[i].request.user.username][this.missionNum - 1] === undefined) {
			this.voteHistory[this.playersInGame[i].request.user.username][this.missionNum - 1] = [];
		}
		if (this.voteHistory[this.playersInGame[i].request.user.username][this.missionNum - 1][this.pickNum - 1] === undefined) {
			this.voteHistory[this.playersInGame[i].request.user.username][this.missionNum - 1][this.pickNum - 1] = "";
		}
	}
}

Game.prototype.VHUpdateTeamPick = function(){
	this.VHCheckUndefined();

	for (var i = 0; i < this.playersInGame.length; i++) {
		if (this.proposedTeam.indexOf(this.playersInGame[i].request.user.username) !== -1) {
			this.voteHistory[this.playersInGame[i].request.user.username][this.missionNum - 1][this.pickNum - 1] += "VHpicked ";
		}

		if (i === this.teamLeader) {
			this.voteHistory[this.playersInGame[i].request.user.username][this.missionNum - 1][this.pickNum - 1] += "VHleader ";
		}
	}
}

Game.prototype.VHUpdateTeamVotes = function(){
	this.VHCheckUndefined();

	for (var i = 0; i < this.playersInGame.length; i++) {
		this.voteHistory[this.playersInGame[i].request.user.username][this.missionNum - 1][this.pickNum - 1] += ("VH" + this.votes[i]);
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


function calcMissionVotes(votes) {

	var requiresTwoFails = false;
	if (this.playersInGame.length >= 7 && this.missionNum === 4) {
		requiresTwoFails = true;
	}

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
		if (votes[i] === "yes") {
			// console.log("app");
			countApp++;
		}
		else if (votes[i] === "no") {
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