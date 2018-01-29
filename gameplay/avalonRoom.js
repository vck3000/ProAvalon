//avalon room object

var playersInGame = [];
var player = [];
var mongoose = require("mongoose");
var User = require("../models/user");

mongoose.connect("mongodb://localhost/TheNewResistanceUsers");
// var sockets = [];

// var host;

// var roomId;

var gameStarted = false;
var finished = false;
var destroyRoom = false;

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

/*

5p - fab 4 + vt
6p - fab 4 + vt + vt 
7p - fab 4 + vt + vt + vs

*/



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


module.exports = function(host_, roomId_){
	//Just to know who is the current host.
	this.host = host_;
	this.roomId = roomId_;
	this.sockets = [];

	//start game
	this.startGame = function(){
		
		if(this.sockets.length < 5){
			//NEED AT LEAST FIVE PLAYERS, SHOW ERROR MESSAGE BACK
			console.log("Not enough players.");
			return false;
		} else if(gameStarted === true){
			console.log("Game already started!");
			return false;
		}


		//make game started after the checks for game already started
		gameStarted = true;


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
			playersInGame[i] = [];
			playersInGame[i].username = this.sockets[i].request.user.username;
			playersInGame[i].socketId = this.sockets[i].id;

			//set the role to be from the roles array with index of the value
			//of the rolesAssignment which has been shuffled
			playersInGame[i].role = roles[rolesAssignment[i]];
		}


		//prepare the data for each person to see
		for(var i = 0; i < playersInGame.length; i++){
			
			//set up the see object.
			playersInGame[i].see = {};
			playersInGame[i].see.spies = [];
			playersInGame[i].see.merlins = [];

			if(playersInGame[i].role === "Merlin"){
				playersInGame[i].see.spies = this.getSpies();
			}
			else if(playersInGame[i].role === "Percival"){
				playersInGame[i].see.merlins = this.getMerlins();

			}
			else if(playersInGame[i].role === "Morgana"){
				playersInGame[i].see.spies = this.getSpies();
			}
			else if(playersInGame[i].role === "Assassin"){
				playersInGame[i].see.spies = this.getSpies();
			} 
			else if(playersInGame[i].role === "Resistance"){
				playersInGame[i].see.spies = [];
			}
		}

		

		return true;
	};

	this.getSpies = function(){
		console.log("get spies: " + gameStarted);
		if(gameStarted === true){
			var array = [];
			for(var i = 0; i < playersInGame.length; i++){
				if(playersInGame[i].role === "Morgana" || playersInGame[i].role === "Assassin" || playersInGame[i].role === "Spy"){
					array.push(playersInGame[i].username);
					// console.log(playersInGame[i].username + "IS A SPY AND IS BEING ADDED!");
				}
			}
			// console.log("Array: " + array)
			return array;
		} else{
			return false;
		}
	}

	this.getMerlins = function(){
		if(gameStarted === true){
			var array = [];
			for(var i = 0; i < playersInGame.length; i++){
				if(playersInGame[i].role === "Merlin" || playersInGame[i].role === "Morgana"){
					array.push(playersInGame[i].username);
				}
			}
			return array;
		} else{
			return false;
		}
	}


	this.playerJoinGame = function(socket){
		//when game hasnt started yet, add the person to the players in game
		if(gameStarted === false){

			// console.log(User.findById(socket.request.user.id));

			// User.findById("5a694cc2802e711c284e2d55", function(err, user){
			// 	console.log("found user");
			// 	console.log(user.avatarImg);
			// });

			User.findById(socket.request.user.id, function(err, user){
				if(err){
					console.log(err);
				} else{
					if(user.avatarImg){
						socket.request.user.avatarImg = user.avatarImg;
						console.log("User has been found!!!!" + socket.request.user.avatarImg);
					} else{
						socket.request.user.avatarImg = "base-res.png";

					}
				}



			});

			this.sockets.push(socket);

			return true;
		} else{
			console.log("Game has already started!");
			return false;
		}
	};


	//when a player leaves before game starts
	this.playerLeaveGameUninitialised = function(socket){
		if(gameStarted === false){
			var i = this.sockets.indexOf(socket);
			this.sockets.splice(i, 1);

			if(this.sockets.length === 0){
				console.log("Room: " + this.roomId + " is empty, destroying...");
				this.destroyRoom = true;
			}

			return true;
		} else{
			console.log("Game has already started!");
			return false;
		}
	};
	
	this.toDestroyRoom = function(){
		return this.destroyRoom;
	}

	//NOTE THIS SHOULD NOT RETURN ROLES OF EACH PLAYER
	//BECAUSE THIS DATA IS BEING SENT RAW TO THE PLAYERS
	this.getPlayers = function(){
		if(gameStarted === false){
			var array = [];
			for(var i = 0; i < this.sockets.length; i++){
				array[i] = {
					username: this.sockets[i].request.user.username,	
					avatarImgRes: this.sockets[i].request.user.avatarImgRes,
					avatarImgSpy: this.sockets[i].request.user.avatarImgSpy
				}
			}
			return array;
		} else{
			//NOOOOOOOOOOOOOOOOOOOOOOOOOOOOO READ ABOVE COMMENT
			// return playersInGame;	
			return false;
		}
	};

	//This code stays only in the server,
	//individual roles will be distributed individually.
	this.getPlayerRoles = function(){
		if(gameStarted === true){
			console.log("GET PLAYER ROLES TRUE");
			return playersInGame;	
		}
		else {
			console.log("GET PLAYER ROLES false");
			console.log("Game hasn't started yet");
			return false;
		}
	}

	this.getSockets = function(){
		return this.sockets;
	}

	this.getHost = function(){
		return this.host;
	};

	this.getStatus = function(){
		if(finished === true){
			return "Finished!";
		} else if(gameStarted === true){
			return "Game started!";
		} else{
			return "Waiting!";
		}
	}

	this.getRoomId = function(){
		return this.roomId;
	}

};