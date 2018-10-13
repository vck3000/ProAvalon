var util = require("util");
var Room = require("./room");
var PlayersReadyNotReady = require("./playersReadyNotReady");

var mongoose = require("mongoose");
var User = require("../models/user");
var GameRecord = require("../models/gameRecord");

mongoose.connect("mongodb://localhost/TheNewResistanceUsers");


var avalonRoles = require("./avalon");

avalonRoles.merlin.test();	



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

	//Game variables
	this.gameStarted = false;


	//Misc variables
	this.chatHistory = []; // Here because chatHistory records after game starts














	//start game
	this.startGame = function (options) {

		this.socketsOfPlayers = this.socketsSittingDown;

		if(this.socketsOfPlayers.length < 5 || this.socketsOfPlayers.length > 10 || this.gamePlayerLeftDuringReady === true){
			this.canJoin = true;
			this.gamePlayerLeftDuringReady = false;
			return false;
		}
		this.startGameTime = new Date();


		//make game started after the checks for game already started
		this.gameStarted = true;

		var rolesAssignment = generateAssignmentOrders(this.socketsOfPlayers.length);

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


		//give roles to the players according to their alliances
		//Get roles:
		this.resRoles = [];
		this.spyRoles = [];
		if (options.merlinassassin === true) { this.resRoles.push("Merlin"); this.spyRoles.push("Assassin"); /*console.log("added merlin assassin"); */}
		if (options.percival === true) { this.resRoles.push("Percival"); /*console.log("Added percy"); */}
		if (options.morgana === true) { this.spyRoles.push("Morgana"); /*console.log("Added morgana"); */}
		if (options.mordred === true) { this.spyRoles.push("Mordred"); /*console.log("added mordred"); */}
		if (options.oberon === true) { this.spyRoles.push("Oberon"); /*console.log("added oberon"); */}
		

		var resPlayers = [];
		var spyPlayers = [];

		this.resistanceUsernames = [];
		this.spyUsernames = [];
		for (var i = 0; i < this.playersInGame.length; i++) {
			if (this.playersInGame[i].alliance === "Resistance") { resPlayers.push(i); this.resistanceUsernames.push(getUsernameFromIndex(this.playersInGame, i));}
			else if (this.playersInGame[i].alliance === "Spy") { spyPlayers.push(i); this.spyUsernames.push(getUsernameFromIndex(this.playersInGame, i));}
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

		for(var i = 0; i < this.playersInGame.length; i++){
			if(this.playersInGame[i].role.toLowerCase() === "Assassin".toLowerCase()){
				this.assassinsUsername = this.playersInGame[i].username;
				break;
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
			// else if (this.playersInGame[i].role === "Percival") {
			// 	this.playersInGame[i].see.merlins = this.getMerlins();
			// }
			// else if (this.playersInGame[i].role === "Morgana") {
			// 	this.playersInGame[i].see.spies = this.getSpies("Morgana");
			// }
			// else if (this.playersInGame[i].role === "Assassin") {
			// 	this.playersInGame[i].see.spies = this.getSpies("Assassin");
			// }
			// else if (this.playersInGame[i].role === "Spy") {
			// 	this.playersInGame[i].see.spies = this.getSpies("Spy");
			// }
			// else if (this.playersInGame[i].role === "Mordred") {
			// 	this.playersInGame[i].see.spies = this.getSpies("Mordred");
			// }
			// else if (this.playersInGame[i].role === "Oberon") {
			// 	this.playersInGame[i].see.spies = this.getSpies("Oberon");
			// }
			// else if (this.playersInGame[i].role === "Resistance") {

			// }
		}

		//set game start parameters
		//get a random starting team leader
		this.teamLeader = getRandomInt(0, this.playersInGame.length);
		this.hammer = ((this.teamLeader - 5 + 1 + this.playersInGame.length) % this.playersInGame.length);

		this.missionNum = 1;
		this.pickNum = 1;
		// this.missionHistory = ["succeeded", "failed", "succeeded"];
		this.missionHistory = [];

		if (options.lady === true) {
			this.lady = (this.teamLeader + 1) % this.playersInGame.length;
			this.ladyablePeople = [];
			for (var i = 0; i < this.playersInGame.length; i++) {
				this.ladyablePeople[i] = true;
			}
			this.ladyablePeople[this.lady] = false;
		}

		var str = "Game started with: ";
		//add res roles: 
		for (var i = 0; i < this.resRoles.length; i++) {
			str += (this.resRoles[i] + ", ");
		}
		for (var i = 0; i < this.spyRoles.length; i++) {
			str += (this.spyRoles[i] + ", ");
		}
		if (options.lady === true) {
			str += "Lady of the Lake, "
		}

		//remove the last , and replace with .
		str = str.slice(0, str.length - 2);
		str += ".";

		// this.gameplayMessage = str;
		this.sendText(this.allSockets, str, "gameplay-text");

		if(options.lady === true){
			this.ladyChain[0] = this.playersInGame[this.lady].role;
		}

		//seed the starting data into the VH
		for (var i = 0; i < this.playersInGame.length; i++) {
			this.voteHistory[this.playersInGame[i].request.user.username] = [];
		}

		this.distributeGameData();

		return true;
	};



	//Misc game room functions
	this.addToChatHistory = function(data){
		if(this.gameStarted === true){
			this.chatHistory.push(data);
		}
	}

	this.getStatus = function () {
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


//Game object inherits all the functions and stuff from Room
Game.prototype = Object.create(Room.prototype);
Game.prototype = Object.create(PlayersReadyNotReady.prototype);



module.exports = Game;