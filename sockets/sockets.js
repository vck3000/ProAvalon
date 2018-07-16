//sockets
var avalonRoom = require("../gameplay/avalonRoom");

var savedGameObj = require("../models/savedGame");

const JSON = require('circular-json');



const dateResetRequired = 1531125110385;

var currentPlayersUsernames = [];
var allSockets = [];

var rooms = [];

//retain only 5 mins.
var allChatHistory = [];
var allChat5Min = [];

var nextRoomId = 1;


savedGameObj.findOne({}).exec(function(err, foundSaveGame){
	if(err){console.log(err);}
	else{
		if(foundSaveGame){
			console.log("Parsed:");
			console.log(JSON.parse(foundSaveGame.room));
	
			var storedData = JSON.parse(foundSaveGame.room);
	
			
	
			rooms[storedData["roomId"]] = new avalonRoom();
	
	
	
	
			for(var key in storedData){
				if(storedData.hasOwnProperty(key)){
					console.log("typeof: " + typeof(key))
					rooms[storedData["roomId"]][key] = storedData[key];
					console.log("copied over: " + key);
					console.log(storedData[key]);
				}
			}
	
			rooms[storedData["roomId"]].restartSaved = true;
			rooms[storedData["roomId"]].playersInRoom = [];

			rooms[storedData["roomId"]].someCutoffPlayersJoined = "no";
	
	
			console.log("New room");
			console.log(rooms[storedData["roomId"]]);
	
			console.log("game start");
			console.log(storedData.gameStarted);
	
			// console.log("sockets");
			// console.log(rooms[storedData["roomId"]].sockets[1]);
	
	
	
			
			// console.log(rooms[storedData["roomId"]]["sockets"].find("request"));
	
			
			// foundSaveGame.remove();
		}
	}
});




var userCommands = {
	commandA: {
		command: "commandA",
		help: "/commandA: Just some text for commandA",
		run: function (args) {
			//do stuff
			return {message: "commandA has been run.", classStr: "server-text"};
		}
	},

	help: {
		command: "help",
		help: "/help: ...shows help",
		run: function (args) {
			//do stuff

			var data = [];
			var i = 0;

			//starting break in the chat
			// data[i] = {message: "-------------------------", classStr: "server-text"};

			// var str = [];
			// str[i] = "-------------------------";

			i++;

			for (var key in userCommands) {
				if (userCommands.hasOwnProperty(key)) {
					// console.log(key + " -> " + p[key]);
					data[i] = {message: userCommands[key].help, classStr: "server-text"};
					// str[i] = userCommands[key].help;
					i++;
					//create a break in the chat
					// data[i] = {message: "-------------------------", classStr: "server-text"};
					// i++;
				}
			}
			// return "Commands are: commandA, help";
			// return str;
			return data;
		}
	},

	buzz: {
		command: "buzz",
		help: "/buzz <playername>: Buzz a player. <playername> must all be in lower case. (until I upgrade this)",
		run: function (args, senderSocket) {
			var buzzSocket = allSockets[args[1]];
			if (buzzSocket) {
				buzzSocket.emit("buzz", senderSocket.request.user.username);
			return {message: "You have buzzed player " + args[1] + ".", classStr: "server-text"};
			}
			else {
				console.log(allSockets);
				return {message: "There is no such player.", classStr: "server-text"};
			}
		}
	},

	slap: {
		command: "slap",
		help: "/slap <playername>: Slap a player for fun. <playername> must all be in lower case. (until I upgrade this)",
		run: function (args, senderSocket) {

			var slapSocket = allSockets[args[1]];
			if (slapSocket) {
				slapSocket.emit("slap", senderSocket.request.user.username);
			return {message: "You have slapped player " + args[1] + "!", classStr: "server-text"};
			}
			else {
				console.log(allSockets);
				return {message: "There is no such player.", classStr: "server-text"};
				
			}
		}
	},

	roomChat: {
		command: "roomChat",
		help: "/roomChat: Get a copy of the chat for the current game.",
		run: function (args, senderSocket) {
			//code
			if(rooms[senderSocket.request.user.inRoomId]){
				return rooms[senderSocket.request.user.inRoomId].getChatHistory();

			}
			else{
				return {message: "The game hasn't started yet. There is no chat to display.", classStr: "server-text"}
			}
		}
	},

	allChat: {
		command: "allChat",
		help: "/allChat: Get a copy of the last 5 minutes of allChat.",
		run: function (args, senderSocket) {
			//code
			return allChat5Min;
		}
	},

	serverRestartWarning: {
		command: "serverRestartWarning",
		help: "/serverRestartWarning: Only for the admin to use :)",
		run: function (args, senderSocket) {
			console.log(allSockets);
			//code
			if(senderSocket.request.user.username === "ProNub"){

				for(var key in allSockets){
					if(allSockets.hasOwnProperty(key)){
						allSockets[key].emit("serverRestartWarning")
					}
				}

				var numOfGamesSaved = 0;
				var numOfGamesEncountered = 0;
				var promises = [];

				//save the games
				for(var i = 0; i < rooms.length; i++){
					if(rooms[i] && rooms[i].gameStarted === true){
						console.log("rooms");
						console.log(rooms[i]);
						
						savedGameObj.create({room: JSON.stringify(rooms[i])}, function(err, savedGame){
							if(err){
								console.log(err);
							}
							console.log(savedGame);
							numOfGamesSaved++;

							console.log("created");
							console.log(numOfGamesSaved >= numOfGamesEncountered);
							console.log(numOfGamesSaved);
							console.log(numOfGamesEncountered);

							if(numOfGamesSaved >= numOfGamesEncountered){
								var data = {message: "Successful. Saved " + numOfGamesSaved + " games.", classStr: "server-text"};
								senderSocket.emit("allChatToClient", data);
								senderSocket.emit("roomChatToClient", data);
							}

						});
						numOfGamesEncountered++;
					}
				}

				console.log(numOfGamesEncountered);
				
				if(numOfGamesEncountered === 0){
					return {message: "Successful. But no games needed to be saved.", classStr: "server-text"};
				}
				else{
					return {message: "Successful. But still saving games.", classStr: "server-text"};
				}

			}
			else{
				return {message: "You are not the admin...", classStr: "server-text"};
			}
		}
	}

};


module.exports = function (io) {
	//SOCKETS for each connection
	io.sockets.on("connection", function (socket) {

		if (socket.request.isAuthenticated()) {
			console.log("User is authenticated");

		} else {
			console.log("User is not authenticated");
			socket.emit("alert", "You are not authenticated.");
			return;
		}
		//if user is already logged in, destroy their last session
		//compare the new username that is lowercased to the list of current usernames lowercased
		var loweredCurrentPlayersUsernames = [];
		for (var i = 0; i < currentPlayersUsernames.length; i++) {
			loweredCurrentPlayersUsernames[i] = currentPlayersUsernames[i].toLowerCase();
		}

		var i = loweredCurrentPlayersUsernames.indexOf(socket.request.user.username.toLowerCase());
		if (i !== -1) {
			//kick the old socket
			allSockets[socket.request.user.username.toLowerCase()].emit("alert", "You've been disconnected");
			allSockets[socket.request.user.username.toLowerCase()].disconnect();
			currentPlayersUsernames.splice(i, 1);
			console.log("User was logged in already, killed last session and socket.")
		}
		console.log(socket.request.user.username + " has connected under socket ID: " + socket.id);

		//automatically join the all chat
		socket.join("allChat");
		//push the new user into our list of players
		currentPlayersUsernames.push(socket.request.user.username);
		currentPlayersUsernames.sort();
		//push the new socket into our list of sockets
		allSockets[socket.request.user.username.toLowerCase()] = socket;

		//send a notif to the user saying logged in
		// socket.emit("success-alert", "Successfully logged in! Welcome, " + socket.request.user.username + "!");

		//socket sends to all players
		var data = {
			message: socket.request.user.username + " has joined the lobby.",
			classStr: "server-text"
		}
		sendToAllChat(io, data);


		//io sends to everyone in the site, including the current user of this socket
		io.in("allChat").emit("update-current-players-list", currentPlayersUsernames);

		updateCurrentGamesList(io);

		//send the user its ID to store on their side.
		socket.emit("username", socket.request.user.username);
		//send the user the list of commands
		socket.emit("commands", userCommands);

		socket.emit("checkSettingsResetDate", dateResetRequired);
		

		//=======================================
		//COMMANDS
		//=======================================

		socket.on("messageCommand", function (data) {
			console.log("data0: " + data.command);
			if (userCommands[data.command]) {

				var dataToSend = userCommands[data.command].run(data.args, socket);

				socket.emit("messageCommandReturnStr", dataToSend);
			}
			else {
				var dataToSend = {
					message: "Invalid command.",
					classStr: "server-text"
				}

				socket.emit("messageCommandReturnStr", dataToSend);
			}
		});

		//when a user tries to send a message to all chat
		socket.on("allChatFromClient", function (data) {
			//socket.emit("danger-alert", "test alert asdf");
			//debugging
			console.log("incoming message from allchat at " + data.date + ": " + data.message + " by: " + socket.request.user.username);
			//get the username and put it into the data object
			data.username = socket.request.user.username;
			//send out that data object to all other clients (except the one who sent the message)

			data.message = textLengthFilter(data.message);
			//no classStr since its a player message

			sendToAllChat(io, data);
		});

		//when a user tries to send a message to room
		socket.on("roomChatFromClient", function (data) {
			// socket.emit("danger-alert", "test alert asdf");
			//debugging
			console.log("incoming message from room at " + data.date + ": " + data.message + " by: " + socket.request.user.username);
			//get the username and put it into the data object
			data.username = socket.request.user.username;

			data.message = textLengthFilter(data.message);

			if (data.roomId) {
				//send out that data object to all clients in room
				
				sendToRoomChat(io, data.roomId, data);
				// io.in(data.roomId).emit("roomChatToClient", data);
			}
		});


		//when a user disconnects/leaves the whole website
		socket.on("disconnect", function (data) {
			//debugging
			console.log(socket.request.user.username + " has left the lobby.");
			//get the index of the player in the array list
			var i = currentPlayersUsernames.indexOf(socket.request.user.username);
			//in case they already dont exist, dont crash server
			if (i === -1) { return; }
			//remove that single player who left
			currentPlayersUsernames.splice(i, 1);
			//send out the new updated current player list
			socket.in("allChat").emit("update-current-players-list", currentPlayersUsernames);
			//tell all clients that the user has left
			var data = {
				message: socket.request.user.username + " has left the lobby.",
				classStr: "server-text"
			}
			sendToAllChat(io, data);

			//Note, by default when socket disconnects, it leaves from all rooms. 
			//If user disconnected from within a room, the leave room function will send a message to other players in room.

			//if they are in a room, say they're leaving the room.
			var data = {
				message: socket.request.user.username + " has left the room.",
				classStr: "server-text"
			}
			sendToRoomChat(io, socket.request.user.inRoomId, data);
			// io.in(socket.request.user.inRoomId).emit("player-left-room", socket.request.user.username);

			removePlayerFromRoomAndCheckDestroy(socket, io);
		});


		//when a new room is created
		socket.on("newRoom", function () {
			//while rooms exist already (in case of a previously saved and retrieved game)
			while(rooms[nextRoomId]){
				nextRoomId++;
			}
			rooms[nextRoomId] = new avalonRoom(socket.request.user.username, nextRoomId, io);
			console.log("new room request");
			//broadcast to all chat
			var data = {
				message: socket.request.user.username + " has created room " + nextRoomId + ".",
				classStr: "server-text"
			}			
			sendToAllChat(io, data);

			console.log(data.message);

			//send to allChat including the host of the game
			// io.in("allChat").emit("new-game-created", str);
			//send back room id to host so they can auto connect
			socket.emit("auto-join-room-id", nextRoomId);

			//increment index for next game
			nextRoomId++;

			updateCurrentGamesList(io);
		});

		//when a player joins a room
		socket.on("join-room", function (roomId) {
			// console.log(roomId);
			// console.log(rooms[roomId]);

			//if the room exists
			if (rooms[roomId]) {
				//set the room id into the socket obj
				socket.request.user.inRoomId = roomId;

				//set them to a spectator
				socket.request.user.spectator = true;

				//join the room chat
				socket.join(roomId);

				//join the room
				rooms[roomId].playerJoinRoom(socket);

				//emit to the new spectator the players in the game.
				socket.emit("update-room-players", rooms[roomId].getPlayers());

				//update the room players
				io.in(roomId).emit("update-room-players", rooms[roomId].getPlayers());

				
				//emit to say to others that someone has joined
				var data = {
					message: socket.request.user.username + " has joined the room.",
					classStr: "server-text"
				}			
				sendToRoomChat(io, roomId, data);

				// io.in(roomId).emit("player-joined-room", socket.request.user.username);

				//if the game has started, and the user who is joining
				//is part of the game, give them the data of the game again
				usernamesInGame = rooms[roomId].getUsernamesInGame();
				if (usernamesInGame.indexOf(socket.request.user.username) !== -1) {

					distributeGameData(socket, io);
					socket.request.user.spectator = false;
				}
				//if game has started, give them a copy of spectator data
				else if (rooms[roomId].getStatus() !== "Waiting") {
					giveGameDataToSpectator(socket, io);
				}

				updateCurrentGamesList(io);


			} else {
				console.log("Game doesn't exist!");
			}
		});

		socket.on("join-game", function (roomId) {
			if (rooms[roomId]) {
				socket.request.user.spectator = false;
				//if the room has not started yet, throw them into the room
				console.log("Game status is: " + rooms[roomId].getStatus());
				if (rooms[roomId].getStatus() === "Waiting") {
					var ToF = rooms[roomId].playerJoinGame(socket);
					console.log(socket.request.user.username + " has joined room " + roomId + ": " + ToF);

					//update the room players
					io.in(roomId).emit("update-room-players", rooms[roomId].getPlayers());
				}
				else {
					console.log("Game has started, player " + socket.request.user.username + " is not allowed to join.");
				}
			}

			updateCurrentGamesList(io);
		});

		//when a player leaves a room
		socket.on("leave-room", function () {
			if (rooms[socket.request.user.inRoomId]) {
				console.log(socket.request.user.username + " is leaving room: " + socket.request.user.inRoomId);
				//broadcast to let others know

				var data = {
					message: socket.request.user.username + " has left the room.",
					classStr: "server-text"
				}
				sendToRoomChat(io, socket.request.user.inRoomId, data);

				// io.in(socket.request.user.inRoomId).emit("player-left-room", socket.request.user.username);

				//remove player from room and check destroy
				removePlayerFromRoomAndCheckDestroy(socket, io);
				//leave the room chat
				socket.leave(socket.request.user.inRoomId);

				//remove from spectators list
				if(rooms[socket.request.user.inRoomId]){
					io.in(socket.request.user.inRoomId).emit("update-room-players", rooms[socket.request.user.inRoomId].getPlayers());
				}
				


				updateCurrentGamesList(io);

			}
		});

		socket.on("player-ready", function (username) {
			if (rooms[socket.request.user.inRoomId]) {

				var data = {
					message: username + " is ready.",
					classStr: "server-text"
				}
				sendToRoomChat(io, socket.request.user.inRoomId, data);
				// io.in(socket.request.user.inRoomId).emit("player-ready", username + " is ready.");

				if (rooms[socket.request.user.inRoomId].playerReady(username) === true) {
					//game will auto start if the above returned true
					distributeGameData(socket, io);
					updateRoomPlayers(io, socket);
				}
			}
		});

		socket.on("player-not-ready", function (username) {
			if (rooms[socket.request.user.inRoomId]) {
				rooms[socket.request.user.inRoomId].playerNotReady(username);
				var data = {
					message: username + " is not ready.",
					classStr: "server-text"
				}
				sendToRoomChat(io, socket.request.user.inRoomId, data);

				// io.in(socket.request.user.inRoomId).emit("player-not-ready", username + " is not ready.");
			}
		});

		socket.on("startGame", function (data) {
			//start the game
			if (rooms[socket.request.user.inRoomId]) {
				if (socket.request.user.inRoomId && socket.request.user.username === rooms[socket.request.user.inRoomId].getHostUsername()) {

					rooms[socket.request.user.inRoomId].hostTryStartGame(data);

					//socket.emit("update-room-players", rooms[roomId].getPlayers());
				} else {
					console.log("Room doesn't exist or user is not host, cannot start game");
					socket.emit("danger-alert", "You are not the host. You cannot start the game.")
					return;
				}
			}

			updateCurrentGamesList(io);
		});

		socket.on("kickPlayer", function (username) {
			console.log("received kick player request: " + username);
			if (rooms[socket.request.user.inRoomId]) {
				rooms[socket.request.user.inRoomId].kickPlayer(username, socket);
				updateRoomPlayers(io, socket);
			}
		});

		//when a player picks a team
		socket.on("pickedTeam", function (data) {
			if (rooms[socket.request.user.inRoomId]) {
				rooms[socket.request.user.inRoomId].playerPickTeam(socket, data);
				distributeGameData(socket, io);
			}
		});

		socket.on("pickVote", function (data) {
			if (rooms[socket.request.user.inRoomId]) {
				rooms[socket.request.user.inRoomId].pickVote(socket, data);
				distributeGameData(socket, io);
			}

		});

		socket.on("missionVote", function (data) {
			if (rooms[socket.request.user.inRoomId]) {
				rooms[socket.request.user.inRoomId].missionVote(socket, data);
				distributeGameData(socket, io);
			}
			//update all the games list (also including the status because game status changes when a mission is voted for)
			updateCurrentGamesList(io);
		});

		socket.on("assassinate", function (data) {
			if (rooms[socket.request.user.inRoomId]) {
				rooms[socket.request.user.inRoomId].assassinate(socket, data);
				distributeGameData(socket, io);
			}
			//update all the games list (also including the status because game status changes when a mission is voted for)
			updateCurrentGamesList(io);
		});

		socket.on("lady", function (data) {
			if (rooms[socket.request.user.inRoomId]) {
				rooms[socket.request.user.inRoomId].useLady(socket, data);
				distributeGameData(socket, io);
			}
		});

		socket.on("claim", function(data){
			if (rooms[socket.request.user.inRoomId]) {
				rooms[socket.request.user.inRoomId].claim(socket);
				updateRoomPlayers(io, socket);
			}
		});

	});
}

function distributeGameData(socket, io) {
	//distribute roles to each player

	updateRoomPlayers(io, socket);

	if(rooms[socket.request.user.inRoomId].gameStarted === true){
		var gameData = rooms[socket.request.user.inRoomId].getGameData();

	

		for (var i = 0; i < Object.keys(gameData).length; i++) {
			//send to each individual player
			console.log("send out game data to player: " + gameData[i].username);
			io.to(gameData[i].socketId).emit("game-data", gameData[i]);
			// console.log(gameData[i]);
			// console.log("Player " + gameData[i].username + " has been given role: " + gameData[i].role);
		}
	
		var gameDataForSpectators = rooms[socket.request.user.inRoomId].getGameDataForSpectators();
		//send out spectator data
		socketsOfSpectators = rooms[socket.request.user.inRoomId].getSocketsOfSpectators();
		console.log("sockets of spectators length: " + socketsOfSpectators.length);
	
		for (var i = 0; i < socketsOfSpectators.length; i++) {
			var socketId = socketsOfSpectators[i].id;
			console.log("Socket id: " + socketId);
			socket.to(socketId).emit("game-data", gameDataForSpectators);
			console.log("(for loop) Sent to spectator: " + socketsOfSpectators[i].request.user.username);
		}
	}
}

function giveGameDataToSpectator(socket, io) {
	var gameDataForSpectators = rooms[socket.request.user.inRoomId].getGameDataForSpectators();
	//send out spectator data
	console.log("Spectator data sent to spectator: " + socket.request.user.username);
	socket.emit("game-data", gameDataForSpectators);
}

function removePlayerFromRoomAndCheckDestroy(socket, io) {
	//remove player from room if he/she is in one
	if (socket.request.user.inRoomId && rooms[socket.request.user.inRoomId]) {
		//leave the room
		rooms[socket.request.user.inRoomId].playerLeaveRoom(socket);
		//check if the room even exists, sometimes with fast refreshes
		//it might already have deleted the room
		//Check if the room needs destroying
		if (rooms[socket.request.user.inRoomId].toDestroyRoom() === true) {
			//destroy room
			rooms[socket.request.user.inRoomId] = undefined;
			//resend the current games list
			updateCurrentGamesList(io);
		}
		//otherwise update room players
		else {
			//update the room players
			updateRoomPlayers(io, socket);

			//also update gamedata for all players
			distributeGameData(socket, io);
		}
	}
}

var updateCurrentGamesList = function (io) {
	//prepare room data to send to players. 
	var gamesList = [];
	for (var i = 0; i < rooms.length; i++) {
		//If the game exists
		if (rooms[i]) {
			//create new array to send
			gamesList[i] = {};
			//get status of game
			gamesList[i].status = rooms[i].getStatus();
			//get room ID
			gamesList[i].roomId = rooms[i].getRoomId();
			gamesList[i].hostUsername = rooms[i].getHostUsername();
			gamesList[i].numOfPlayersInside = rooms[i].getNumOfPlayersInside();
			gamesList[i].numOfSpectatorsInside = rooms[i].getNumOfSpectatorsInside();
		}
	}
	io.in("allChat").emit("update-current-games-list", gamesList);
}



function updateRoomPlayers(io, socket) {
	io.in(socket.request.user.inRoomId).emit("update-room-players", rooms[socket.request.user.inRoomId].getPlayers());
}

function textLengthFilter(str) {
	var lengthLimit = 500;

	if (str.length > lengthLimit) {
		return str.slice(0, lengthLimit);
	}
	else{
		return str;
	}
}


var fiveMinsInMillis = 1000 * 60 * 5;
// var fiveMinsInMillis = 10000; //10 seconds just for testing


function sendToAllChat(io, data){
	io.in("allChat").emit("allChatToClient", data);

	var date = new Date();
	data.dateCreated = date;

	allChatHistory.push(data);

	allChat5Min.push(data);

	
	var i = 0;
	

	while(date - allChat5Min[i].dateCreated > fiveMinsInMillis){
		if(i >= allChat5Min.length){
			break;
		}
		i++;
	}

	if(i !== 0){
		//console.log("Messages older than 5 mins detected. Deleting old ones. index: " + i);
		//starting from index 0, remove i items.
		allChat5Min.splice(0, i);
	}

}

function sendToRoomChat(io, roomId, data){
	io.in(roomId).emit("roomChatToClient", data);
	// io.in(socket.request.user.inRoomId).emit("player-ready", username + " is ready.");

	if(rooms[roomId]){
		rooms[roomId].addToChatHistory(data);
	}
}