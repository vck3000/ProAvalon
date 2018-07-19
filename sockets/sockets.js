//sockets
var avalonRoom = require("../gameplay/avalonRoom");

var savedGameObj = require("../models/savedGame");
var modAction = require("../models/modAction");
var currentModActions = [];

var User  = require("../models/user");

const JSON = require('circular-json');


var modsArray = require("../modsadmins/mods");
var adminsArray = require("../modsadmins/admins");

var actionsObj = require("./commands");
var userCommands = actionsObj.userCommands;
var modCommands = actionsObj.modCommands;
var adminCommands = actionsObj.adminCommands;



const dateResetRequired = 1531125110385;


var allSockets = [];

var rooms = [];

//retain only 5 mins.
var allChatHistory = [];
var allChat5Min = [];

var nextRoomId = 1;


savedGameObj.find({}).exec(function(err, foundSaveGameArray){
	if(err){console.log(err);}
	else{
		for(var key in foundSaveGameArray){
			if(foundSaveGameArray.hasOwnProperty(key)){
				// console.log(foundSaveGameArray);

				var foundSaveGame = foundSaveGameArray[key];

				if(foundSaveGame){
					// console.log("Parsed:");
					// console.log(JSON.parse(foundSaveGame.room));
			
					var storedData = JSON.parse(foundSaveGame.room);
			
					rooms[storedData["roomId"]] = new avalonRoom();
			
					for(var key in storedData){
						if(storedData.hasOwnProperty(key)){
							// console.log("typeof: " + typeof(key))
							rooms[storedData["roomId"]][key] = storedData[key];
							// console.log("copied over: " + key);
							// console.log(storedData[key]);
						}
					}
			
					rooms[storedData["roomId"]].restartSaved = true;
					rooms[storedData["roomId"]].frozen = true;
					rooms[storedData["roomId"]].playersInRoom = [];
		
					rooms[storedData["roomId"]].someCutoffPlayersJoined = "no";
					rooms[storedData["roomId"]].socketsOfSpectators = [];

					console.log("Game loaded");
				}
			}
		}
	}
});


//load up all the modActions that are not released yet
modAction.find({whenRelease: {$gt: new Date()}, type: "mute"}, function(err, allModActions){
	
	for(var i = 0; i < allModActions.length; i++){
		currentModActions.push(allModActions[i]);
	}
	console.log("mute");
	console.log(currentModActions);
});



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

		//check if they have a ban or a mute

		for(var i = 0; i < currentModActions.length; i++){
			if(currentModActions[i].bannedPlayer.id && socket.request.user.id.toString() === currentModActions[i].bannedPlayer.id.toString()){
				if(currentModActions[i].type === "mute"){
					socket.emit("muteNotification", currentModActions[i]);
				}
			}
		}

		console.log(socket.request.user.username + " has connected under socket ID: " + socket.id);


		var playerIds = getPlayerIdsFromAllSockets();
		console.log("Player ids");
		console.log(playerIds);

		console.log("new playerID");
		console.log(socket.request.user.id);
		//keep removing all the sockets when the player ids still exist.
		if(playerIds.indexOf(socket.request.user.id) !== -1){
			console.log("disconnected a player who already is logged in");
			console.log("disconnected  " + socket.request.user.username);
			
			allSockets[playerIds.indexOf(socket.request.user.id)].emit("disconnect");
			
			allSockets.splice(playerIds.indexOf(socket.request.user.id), 1);
			playerIds = getPlayerIdsFromAllSockets();
			
		}

		//now push their socket in
		allSockets.push(socket);


		//send the user its ID to store on their side.
		socket.emit("username", socket.request.user.username);
		//send the user the list of commands
		socket.emit("commands", userCommands);

		//if the mods name is inside the array
		if(modsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1 ){
			//send the user the list of commands
			socket.emit("modCommands", modCommands);
		}

		//if the admin name is inside the array
		if(adminsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1 ){
			//send the user the list of commands
			socket.emit("adminCommands", adminCommands);
		}

		socket.emit("checkSettingsResetDate", dateResetRequired);
		


		//automatically join the all chat
		socket.join("allChat");
		//socket sends to all players
		var data = {
			message: socket.request.user.username + " has joined the lobby.",
			classStr: "server-text-teal"
		}
		sendToAllChat(io, data);

		io.in("allChat").emit("update-current-players-list", getPlayerUsernamesFromAllSockets());

		updateCurrentGamesList(io);




		//when a user disconnects/leaves the whole website
		socket.on("disconnect", function (data) {
			//debugging
			console.log(socket.request.user.username + " has left the lobby.");
			
			var playerIds = getPlayerIdsFromAllSockets();

			console.log("Player ids");
			console.log(playerIds);

			console.log("disconnecting playerID++");
			console.log(socket.request.user.id);
			console.log("disconnecting playerID--");
			

			//remove them from all sockets
			
			if(playerIds.indexOf(socket.request.user.id) !== -1){
				console.log("A player just disconnected. Removed their socket.");
				console.log("disconnecting: " + socket.request.user.username);
				
				allSockets[playerIds.indexOf(socket.request.user.id)].disconnect(true);
				allSockets.splice(playerIds.indexOf(socket.request.user.id), 1);
				
				
				playerIds = getPlayerIdsFromAllSockets();
			}

			//send out the new updated current player list
			socket.in("allChat").emit("update-current-players-list", getPlayerUsernamesFromAllSockets());
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

			playerLeaveRoomCheckDestroy(socket, io);
		});


		socket.on("modAction", async function(data){

			if(modsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1){
				// var parsedData = JSON.parse(data);
				console.log(data);

				var newModAction = {};

				console.log("a");

				var leave = false;

				data.forEach(async function(item){
					console.log("b");
					if(item.name === "banPlayerUsername"){
						console.log("b(a)");
						await User.find({username: item.value}, function(err, foundUser){
							if(err){console.log(err);}
							else{
								foundUser = foundUser[0];
								console.log("b(b)");
								if(!foundUser){
									socket.emit("messageCommandReturnStr", {message: "User not found. Please check spelling and caps.", classStr: "server-text"});
									leave = true;
									return;
								}
								// console.log(foundUser);
								newModAction.bannedPlayer = {};
								newModAction.bannedPlayer.id = foundUser._id;
								newModAction.bannedPlayer.username = foundUser.username;
							}
						});
					}
					else if(item.name === "typeofmodaction"){
						newModAction.type = item.value;
					}
					else if(item.name === "reasonofmodaction"){
						newModAction.reason = item.value;
					}
					else if(item.name === "durationofmodaction"){
						var oneSec = 1000;
						var oneMin = oneSec*60;
						var oneHr = oneMin*60;
						var oneDay = oneHr*24;
						var oneMonth = oneDay*30;
						//30 min, 3hr, 1 day, 3 day, 7 day, 1 month
						var durations = [
							oneMin*30,
							oneHr*3,
							oneDay,
							oneDay*3,
							oneDay*7,
							oneMonth
						];
						newModAction.durationToBan = new Date(durations[item.value]);
					}
					else if(item.name === "descriptionByMod"){
						newModAction.descriptionByMod = item.value;
					}
				});

				console.log("c");

				if(leave === true){
					return;
				}
				
				await User.findById(socket.request.user.id, function(err, foundUser){
					if(err){console.log(err);}
					else{
						newModAction.modWhoBanned = {};
						newModAction.modWhoBanned.id = foundUser._id;
						newModAction.modWhoBanned.username = foundUser.username;
						console.log("1");
					}
				});

				console.log("2");

				newModAction.whenMade = new Date();
				newModAction.whenRelease = newModAction.whenMade.getTime() + newModAction.durationToBan.getTime();

				console.log(newModAction);
				if(leave === false && newModAction.bannedPlayer && newModAction.bannedPlayer.username){
					console.log("****************");
					modAction.create(newModAction,function(err, newModActionCreated){
						console.log(newModActionCreated);
						//push new mod action into the array of currently active ones loaded.
						currentModActions.push(newModActionCreated);
						//if theyre online
						if(newModActionCreated.type === "ban" && allSockets[newModActionCreated.bannedPlayer.username.toLowerCase()]){
							allSockets[newModActionCreated.bannedPlayer.username.toLowerCase()].disconnect(true);
						}
						else if(newModActionCreated.type === "mute" && allSockets[newModActionCreated.bannedPlayer.username.toLowerCase()]){
							allSockets[newModActionCreated.bannedPlayer.username.toLowerCase()].emit("muteNotification", newModActionCreated);
						}

						socket.emit("messageCommandReturnStr", {message: newModActionCreated.bannedPlayer.username + " has received a " + newModActionCreated.type + " modAction. Thank you :).", classStr: "server-text"});
					});
				}
				else{
					socket.emit("messageCommandReturnStr", {message: "Something went wrong... Contact the admin!", classStr: "server-text"});
				}
			}
			else{
				//create a report. someone doing something bad.
			}
		});

		//=======================================
		//COMMANDS
		//=======================================

		socket.on("messageCommand", function (data) {
			console.log("data0: " + data.command);
			console.log("mod command exists: " + modCommands[data.command]);
			console.log("Index of mods" + modsArray.indexOf(socket.request.user.username.toLowerCase()));
			
			

			if (userCommands[data.command]) {
				var dataToSend = userCommands[data.command].run(data, socket);
				socket.emit("messageCommandReturnStr", dataToSend);
			}
			else if(modCommands[data.command] && modsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1){
				var dataToSend = modCommands[data.command].run(data, socket);
				socket.emit("messageCommandReturnStr", dataToSend);
			}
			else if(adminCommands[data.command] && adminsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1){
				var dataToSend = adminCommands[data.command].run(data, socket);
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

			var toContinue = !isMuted(socket);

			// console.log(toContinue);

			if(toContinue){
				console.log("allchat: " + data.message + " by: " + socket.request.user.username);
				//get the username and put it into the data object
				data.username = socket.request.user.username;
				//send out that data object to all other clients (except the one who sent the message)
				data.message = textLengthFilter(data.message);
				//no classStr since its a player message

				sendToAllChat(io, data);
			}
		});

		//when a user tries to send a message to room
		socket.on("roomChatFromClient", function (data) {
			// socket.emit("danger-alert", "test alert asdf");
			//debugging

			var toContinue = !isMuted(socket);
			
			if(toContinue){
				console.log("roomchat: " + data.message + " by: " + socket.request.user.username);
				//get the username and put it into the data object
				data.username = socket.request.user.username;

				data.message = textLengthFilter(data.message);

				if (data.roomId) {
					//send out that data object to all clients in room
					
					sendToRoomChat(io, data.roomId, data);
					// io.in(data.roomId).emit("roomChatToClient", data);
				}
			}
		});


		//when a new room is created
		socket.on("newRoom", function () {

			var toContinue = !isMuted(socket);

			if(toContinue){
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

				updateCurrentGamesList();
			}
		});

		//when a player joins a room
		socket.on("join-room", function (roomId) {
			// console.log(roomId);
			// console.log(rooms[roomId]);

			//if the room exists
			if (rooms[roomId]) {
				console.log("room id is: ");
				console.log(roomId);
				
				//set the room id into the socket obj
				socket.request.user.inRoomId = roomId;

				//join the room chat
				socket.join(roomId);

				//join the room
				rooms[roomId].playerJoinRoom(socket);


				
				
				//emit to say to others that someone has joined
				var data = {
					message: socket.request.user.username + " has joined the room.",
					classStr: "server-text-teal"
				}			
				sendToRoomChat(io, roomId, data);

				

				//This stuff should be handled within the avalonRoom file

				//emit to the new spectator the players in the game.
				// socket.emit("update-room-players", rooms[roomId].getPlayers());

				//if the game has started, and the user who is joining
				//is part of the game, give them the data of the game again
				// usernamesInGame = rooms[roomId].getUsernamesInGame();
				// if (usernamesInGame.indexOf(socket.request.user.username) !== -1) {
				// 	distributeGameData(socket, io);
				// 	// socket.request.user.spectator = false;
				// }

				//if game has started, give them a copy of spectator data
				// else if (rooms[roomId].getStatus() !== "Waiting") {
				// 	giveGameDataToSpectator(socket, io);
				// }

			} else {
				console.log("Game doesn't exist!");
			}
		});

		socket.on("join-game", function (roomId) {
			var toContinue = !isMuted(socket);

			if(toContinue){
				if (rooms[roomId]) {
					
					//if the room has not started yet, throw them into the room
					console.log("Game status is: " + rooms[roomId].getStatus());

					if (rooms[roomId].getStatus() === "Waiting") {
						var ToF = rooms[roomId].playerJoinGame(socket);
						console.log(socket.request.user.username + " has joined room " + roomId + ": " + ToF);
					}
					else {
						console.log("Game has started, player " + socket.request.user.username + " is not allowed to join.");
					}
					updateCurrentGamesList();
				}
			}
		});

		//when a player leaves a room
		socket.on("leave-room", function () {
			console.log("In room id");
			console.log(socket.request.user.inRoomId);

			if (rooms[socket.request.user.inRoomId]) {
				console.log(socket.request.user.username + " is leaving room: " + socket.request.user.inRoomId);
				//broadcast to let others know

				var data = {
					message: socket.request.user.username + " has left the room.",
					classStr: "server-text"
				}
				sendToRoomChat(io, socket.request.user.inRoomId, data);

				playerLeaveRoomCheckDestroy(socket);
				
				//leave the room chat
				socket.leave(socket.request.user.inRoomId);
				
				updateCurrentGamesList();
			}
		});

		socket.on("player-ready", function (username) {
			if (rooms[socket.request.user.inRoomId]) {

				var data = {
					message: username + " is ready.",
					classStr: "server-text"
				}
				sendToRoomChat(io, socket.request.user.inRoomId, data);
				

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

		var roomId = socket.request.user.inRoomId;

		console.log("roomId distribute: " + roomId);

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

var updateCurrentGamesList = function () {
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

	allSockets.forEach(function(sock){
		sock.emit("update-current-games-list", gamesList);
	});
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

function sendToAllChat(io, data){

	allSockets.forEach(function(sock){
		sock.emit("allChatToClient", data);
	});
	// io.in("allChat").emit("allChatToClient", data);

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

function isMuted(socket){
	returnVar = false;
	currentModActions.forEach(function(oneModAction){
		// console.log(oneModAction);
		if(oneModAction.type === "mute" && oneModAction.bannedPlayer && oneModAction.bannedPlayer.id && oneModAction.bannedPlayer.id.toString() === socket.request.user.id.toString()){
			socket.emit("muteNotification", oneModAction);
			// console.log("TRUEEEE");

			returnVar = true;
			return;
		}
	});

	return returnVar;
}

function getPlayerIdsFromAllSockets(){
	var playerIds = [];
	for(var i = 0; i < allSockets.length; i++){
		playerIds[i] = allSockets[i].request.user.id;
		console.log(allSockets[i].request.user.id);
	}
	return playerIds;
}

function getPlayerUsernamesFromAllSockets(){
	var playerUsernames = [];
	for(var i = 0; i < allSockets.length; i++){
		playerUsernames[i] = allSockets[i].request.user.username;
		console.log("getPlayerUsernamesFromAllSockets" + allSockets[i].request.user.username);
	}
	return playerUsernames;
}


function playerLeaveRoomCheckDestroy(socket){

	if(socket.request.user.inRoomId && rooms[socket.request.user.inRoomId]){
		rooms[socket.request.user.inRoomId].playerLeaveRoom(socket);
		var toDestroy = rooms[socket.request.user.inRoomId].toDestroy();
		if(toDestroy){
			rooms[socket.request.user.inRoomId] = undefined;
		}
		socket.request.user.inRoomId = undefined;
	}
}

