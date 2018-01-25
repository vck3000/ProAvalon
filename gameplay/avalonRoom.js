//avalon room object

var playersInGame = [];
var player = [];

var sockets = [];

// var host;

// var roomId;

var gameStarted = false;
var finished = false;

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

	//start game
	this.startGame = function(){

		if(sockets.length < 5){
			//NEED AT LEAST FIVE PLAYERS, SHOW ERROR MESSAGE BACK
			console.log("Not enough players.");
			return false;
		} else if(gameStarted === true){
			console.log("Game already started!");
			return false;
		}

		var playersYetToInitialise = [];
		var rolesAssignment = [];

		//create the starting array for role assignment
		for(var i = 0; i < sockets.length; i++){
			rolesAssignment[i] = i;
		}

		//shuffle 3 times
		var rolesAssignment = shuffle(rolesAssignment);
		rolesAssignment = shuffle(rolesAssignment);
		rolesAssignment = shuffle(rolesAssignment);

		//Now we initialise roles
		for(var i = 0; i < players.length; i++){
			playersInGame[i] = [];
			playersInGame[i].username = sockets[i].request.user.username;
			playersInGame[i].socketId = sockets[i].id;
			//set the role to be from the roles array with index of the value
			//of the rolesAssignment which has been shuffled
			playersInGame[i].role = roles[rolesAssignment[i]];
		}

		return true;
	};


	this.playerJoinGame = function(socket){
		//when game hasnt started yet, add the person to the players in game
		if(gameStarted === false){
			sockets.push(socket);
			return true;
		} else{
			console.log("Game has already started!");
			return false;
		}
	};


	//when a player leaves before game starts
	this.playerLeaveGameUninitialised = function(socket){
		if(gameStarted === false){
			var i = sockets.indexOf(socket);
			sockets.splice(i, 1);
			return true;
		} else{
			console.log("Game has already started!");
			return false;
		}
	};

	this.getPlayers = function(){
		if(gameStarted === false){
			var array = [];
			for(var i = 0; i < sockets.length; i++){
				array[i] = sockets[i].request.user.username;
			}
		} else{
			return playersInGame;	
		}
	};

	this.getSockets = function(){
		return sockets;
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