//avalon room object

var util = require("util");

var mongoose = require("mongoose");
var User = require("../models/user");

mongoose.connect("mongodb://localhost/TheNewResistanceUsers");
// var sockets = [];

// var host;

// var roomId;


var roles = [
"Merlin",
"Percival",
"Morgana",
"Assassin",
"Resistance",

//6P addition
"Resistance",

//7P addition
"Spy"
];

var numPlayersOnMission = [
["2","3","2","3","3"],
["2","3","4","3","4"],
["1","1","1","1","1"],
["1","1","1","1","1"],
["1","1","1","1","1"]

]

/*

5p - fab 4 + vt
6p - fab 4 + vt + vt 
7p - fab 4 + vt + vt + vs

*/






module.exports = function(host_, roomId_){

	this.playersInGame = [];
	this.player = [];
	this.gameStarted = false;
	this.finished = false;
	this.destroyRoom = false;


	this.teamLeader = 0;
	this.missionNum = 0; 
	this.missionHistory = [];
	this.pickNum = 0;
	this.gameHistory = [];


	this.playersYetToVote = [];
	this.votingPhase = false;
	this.proposedTeam = [];
	this.votes = [];

	//Just to know who is the current host.
	this.host = host_;
	this.roomId = roomId_;
	//NOTE this is the list of sockets of PLAYERS IN THE GAME
	//not including spectators
	this.sockets = [];

	this.vote = function(socket, voteStr){
		if(this.votingPhase === true){

			var i = this.playersYetToVote.indexOf(socket.request.user.username);

			//if this vote is coming from someone who hasn't voted yet
			if(i !== -1){
				if(voteStr === "approve"){
					this.votes[getIndexFromUsername(this.sockets, socket.request.user.username)] = "approve";
					console.log("received approve from " + socket.request.user.username);
				}
				else if(voteStr === "reject"){
					this.votes[getIndexFromUsername(this.sockets, socket.request.user.username)] = "reject";
					console.log("received reject from " + socket.request.user.username);
				}	
				this.playersYetToVote.splice(i, 1);	
			}
			else{
				console.log("Player has already voted or is not in the game");
			}
		}

		//if our votes array is the same length as the number of players, then we have
		//all of our votes. proceed to next part of the game.
		if(this.playersYetToVote.length === 0){

			this.votingPhase = false;
			var outcome = calcVotes(this.votes);

			
			
			this.proposedTeam = [];

			this.pickNum++;
			if(this.pickNum > 5){
				this.pickNum = 1;
				this.missionNum++;
			}
			this.teamLeader--;
			if(this.teamLeader < 0){
				this.teamLeader = this.sockets.length - 1; 
			}
		}

		console.log("Players yet to vote: " + util.inspect(this.playersYetToVote, {depth: 2}));
	}

	this.playerPickTeam = function(socket, pickedTeam){
		if(getIndexFromUsername(this.sockets, socket.request.user.username) === this.teamLeader){
			console.log("Team leader has picked: ");

			var splitStr = pickedTeam.split(" ");
			for(var i = 0; i < splitStr.length-1; i++){
				
				console.log(splitStr[i] + " and ");

				this.proposedTeam[i] = splitStr[i];
			}
			this.votingPhase = true;
			this.playersYetToVote = this.getUsernamesInGame();
		}
		else{
			console.log("You are not the team leader, you cannot make a pick");
		}
	}

	this.getStatusMessage = function(){
		if(this.votingPhase === false){
			console.log(this.teamLeader);
			var str = "Waiting on " + this.playersInGame[this.teamLeader].username + " to pick.";
			return str;
		} else{
			var str = "Voting phase";
			return str;
		}
	};

	this.getGameData = function(){
		//get the player roles first
		console.log("Get game data called within avalonRoom");

		var data = {};

		var playerRoles = this.playersInGame;
		// console.log("Player roles: " + playerRoles);

		// console.log("player length: " + playerRoles.length);

		//set up the object first, because we cannot pass an array through
		//socket.io
		for(var i = 0; i < playerRoles.length; i++){
			data[i] = {
				role: playerRoles[i].role,
				see: playerRoles[i].see,
				teamLeader: playerRoles[i].teamLeader,
				username: playerRoles[i].username,
				socketId: playerRoles[i].socketId
			}
		}

		//add on these common variables
		for(var i = 0; i < playerRoles.length; i++){
			data[i].statusMessage = this.getStatusMessage();
			data[i].missionNum = this.missionNum;
			data[i].missionHistory = this.missionHistory;
			data[i].pickNum = this.pickNum;
			data[i].gameHistory = this.gameHistory;
			data[i].teamLeader = this.teamLeader;

			data[i].playersYetToVote = this.playersYetToVote;
			data[i].votingPhase = this.votingPhase;
			data[i].proposedTeam = this.proposedTeam;

			data[i].numPlayersOnMission = numPlayersOnMission[playerRoles.length - 5]; //- 5

			// console.log(data[i]);

		}

		// console.log("data: " + util.inspect(data, {depth: 4}));

		return data;
	};

	


	//start game
	this.startGame = function(){

		if(this.sockets.length < 5){
			//NEED AT LEAST FIVE PLAYERS, SHOW ERROR MESSAGE BACK
			console.log("Not enough players.");
			return false;
		} else if(this.gameStarted === true){
			console.log("Game already started!");
			return false;
		}

		//make game started after the checks for game already started
		this.gameStarted = true;

		var playersYetToInitialise = [];
		var rolesAssignment = [];

		//create the starting array for role assignment
		for(var i = 0; i < this.sockets.length; i++){
			rolesAssignment[i] = i;
		}

		//shuffle 3 times
		var rolesAssignment = shuffle(rolesAssignment);
		rolesAssignment = shuffle(rolesAssignment);
		rolesAssignment = shuffle(rolesAssignment);

		//Now we initialise roles
		for(var i = 0; i < this.sockets.length; i++){
			this.playersInGame[i] = {};
			this.playersInGame[i].username = this.sockets[i].request.user.username;
			this.playersInGame[i].socketId = this.sockets[i].id;

			//set the role to be from the roles array with index of the value
			//of the rolesAssignment which has been shuffled
			this.playersInGame[i].role = roles[rolesAssignment[i]];
		}


		//prepare the data for each person to see
		for(var i = 0; i < this.playersInGame.length; i++){
			
			//set up the see object.
			this.playersInGame[i].see = {};
			this.playersInGame[i].see.spies = [];
			this.playersInGame[i].see.merlins = [];

			//give the respective role their data/info
			if(this.playersInGame[i].role === "Merlin"){
				this.playersInGame[i].see.spies = this.getSpies();
			}
			else if(this.playersInGame[i].role === "Percival"){
				this.playersInGame[i].see.merlins = this.getMerlins();
			}
			else if(this.playersInGame[i].role === "Morgana"){
				this.playersInGame[i].see.spies = this.getSpies();
			}
			else if(this.playersInGame[i].role === "Assassin"){
				this.playersInGame[i].see.spies = this.getSpies();
			} 
			else if(this.playersInGame[i].role === "Resistance"){
			}
		}

		//set game start parameters
		//get a random starting team leader
		this.teamLeader = getRandomInt(0,this.sockets.length);
		this.missionNum = 4; 
		this.pickNum = 3;	
		this.missionHistory = ["succeed", "fail", "fail"];

		return true;
	};

	this.getSpies = function(){
		if(this.gameStarted === true){
			var array = [];
			for(var i = 0; i < this.playersInGame.length; i++){
				if(this.playersInGame[i].role === "Morgana" || this.playersInGame[i].role === "Assassin" || this.playersInGame[i].role === "Spy"){
					array.push(this.playersInGame[i].username);
				}
			}
			return array;
		} else{
			return false;
		}
	}

	this.getMerlins = function(){
		if(this.gameStarted === true){
			var array = [];
			for(var i = 0; i < this.playersInGame.length; i++){
				if(this.playersInGame[i].role === "Merlin" || this.playersInGame[i].role === "Morgana"){
					array.push(this.playersInGame[i].username);
				}
			}
			return array;
		} else{
			return false;
		}
	}


	this.playerJoinGame = function(socket){
		//get a list of usernames in the game
		//because if a player had left and came back into the room
		//we want to re-update their data they see

		var usernames = this.getUsernamesInGame();

		//when game hasnt started yet, add the person to the players in game
		if(this.gameStarted === false){
			this.sockets.push(socket);
			return true;
		} 
		//if the player joining is already part of the game
		else if(usernames.indexOf(socket.request.username) !== -1){
			//this.sockets.push(socket);
			return true;
		} 
		else{
			console.log("Game has already started!");
			return false;
		}
	};


	//when a player leaves before game starts
	this.playerLeaveGameUninitialised = function(socket){
		if(this.gameStarted === false){
			//get rid of their socket
			var i = this.sockets.indexOf(socket);
			this.sockets.splice(i, 1);

			if(this.sockets.length === 0){
				console.log("Room: " + this.roomId + " is empty, destroying...");
				this.destroyRoom = true;
			}

			return true;
		} else{
			console.log("Player left mid-game!");
			return false;
		}
	};
	
	this.toDestroyRoom = function(){
		return this.destroyRoom;
	}

	this.getPlayers = function(){
		var array = [];
		for(var i = 0; i < this.sockets.length; i++){
			array[i] = {
				username: this.sockets[i].request.user.username,	
				avatarImgRes: this.sockets[i].request.user.avatarImgRes,
				avatarImgSpy: this.sockets[i].request.user.avatarImgSpy
			}

			//give the host the teamLeader star
			if(array[i].username === this.host){
				array[i].teamLeader = true;
			}
		}
		return array;
	};

	this.getUsernamesInGame = function(){
		if(this.gameStarted === true){
			var array = [];
			for(var i = 0; i < this.sockets.length; i++){
				array[i] = this.sockets[i].request.user.username;
			}
			return array;	
		}
		else{
			return [];
		}
	}

	//This code stays only in the server,
	//individual roles will be distributed individually.
	this.getPlayerRoles = function(){
		if(this.gameStarted === true){
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

	this.getSockets = function(){
		return this.sockets;
	};

	this.getHost = function(){
		return this.host;
	};

	this.getStatus = function(){
		if(this.finished === true){
			return "Finished!";
		} else if(this.gameStarted === true){
			return "Game started!";
		} else{
			return "Waiting!";
		}
	}

	this.getRoomId = function(){
		return this.roomId;
	}
};


function calcVotes(votes){
	var numOfPlayers = votes.length;

	var countApp = 0;
	var countRej = 0;

	var outcome;

	for(var i = 0; i < numOfPlayers; i++){
		if(votes[i] === "approve"){
			console.log("app");
			countApp++;
		}
		else if(votes[i] === "reject"){
			console.log("rej");
			countRej++;
		}
		else{
			console.log("Bad vote: " + votes[i]);
		}
	}	

	//calcuate the outcome
	if(countApp > countRej){
		outcome = "approved";
	}
	else{
		outcome = "rejected";
	}

	return outcome;
}

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

function getIndexFromUsername(sockets, username){
	for(var i = 0; i < sockets.length; i++){
		if(username === sockets[i].request.user.username){
			return i;
		}
	}
}