//room object

function Room(host_, roomId_, io_, maxNumPlayers_, newRoomPassword_) {

	var thisRoom = this;
	
	if(newRoomPassword_ === ""){
		newRoomPassword_ = undefined;
	}

	if(maxNumPlayers_ === "" || maxNumPlayers_ < 5 || maxNumPlayers_ > 10 ){
		maxNumPlayers_ = 10;
	}

	// Object input variables
	this.host 						= host_;
	this.roomId 					= roomId_;
    this.io 						= io_;
	this.maxNumPlayers 				= maxNumPlayers_;
	this.joinPassword 				= newRoomPassword_;

	// Misc. variables
	this.canJoin 					= true;    
    this.gamePlayerLeftDuringReady 	= false;
	
	// Sockets
	this.allSockets 				= [];
	this.socketsSittingDown 		= [];

	// Arrays containing lower cased usernames
	this.kickedPlayers 				= [];
	this.claimingPlayers 			= [];


    this.playerJoinRoom = function (socket, inputPassword) {
		console.log("Room.js file should print next after game.js.");
		// console.log("Inputpassword from avalonRoom: " + inputPassword);
		console.log(socket.request.user.username + " has joined room " + thisRoom.roomId);

		//if the room has a password and user hasn't put one in yet
		if(thisRoom.joinPassword !== undefined && inputPassword === undefined){
			socket.emit("joinPassword", this.roomId);
			// console.log("No password inputted!");
			
			return false;
		}
		//if the room has a password and user HAS put a password in
		else if(thisRoom.joinPassword !== undefined && inputPassword !== undefined){
			if(thisRoom.joinPassword === inputPassword){
				// console.log("Correct password!");

				socket.emit("correctRoomPassword");
				//continue on
			}
			else{
				// console.log("Wrong password!");
				
				// socket.emit("danger-alert", "The password you have inputted is incorrect.");
				socket.emit("wrongRoomPassword");
				socket.emit("changeView", "lobby");
				return false;
			}
		}

		thisRoom.allSockets.push(socket);

		thisRoom.updateRoomPlayers();

		return true;
	}
	
	this.playerSitDown = function(socket) {
		socketUsername = socket.request.user.username;

		// If they were kicked and banned
		if(thisRoom.kickedPlayers.indexOf(socketUsername.toLowerCase()) !== -1){
			//TODO: Emit to them that they were kicked and are banned from the room.
			return;
		}
		// If there aren't too many players already sitting down
		else if(thisRoom.socketsSittingDown < thisRoom.maxNumPlayers_){
			//TODO: Emit to them that max num of players has been reached
			return;
		}
		// If they already exist, no need to add
		else if(thisRoom.allSockets.indexOf(socket) === -1){
			return;
		}

		// If the socket passes all the tests, then push them
		thisRoom.socketsSittingDown.push(socket);

		thisRoom.updateRoomPlayers();
	}
    
    this.playerStandUp = function(socket) {
		var index = thisRoom.socketsSittingDown.indexOf(socket);
		if(index !== -1){
			thisRoom.socketsSittingDown.splice(index, 1);
		}
		thisRoom.updateRoomPlayers();
	};

	this.playerLeaveRoom = function (socket) {
		// When a player leaves during ready, not ready phase
		if(this.socketsSittingDown.indexOf(socket) !== -1){
			this.gamePlayerLeftDuringReady = true;
		}

		// Remove them from all sockets
		var index = this.allSockets.indexOf(socket);
		if(index !== -1){
			this.allSockets.splice(index, 1);
		}

		// In case they were sitting down, remove them
		this.playerStandUp(socket);
		
		// Set the host to the first person in the sitting down array in case the previous host left
		if(this.socketsSittingDown[0]){
			this.host = this.socketsSittingDown[0].request.user.username;
		}
	
		// Destroy room if there's no one in it anymore
		if (this.allSockets.length === 0) {
			console.log("Room: " + this.roomId + " is empty, destroying...");
			this.destroyRoom = true;
		}

		this.updateRoomPlayers();
	};


    this.kickPlayer = function (username, socket) {
		if (this.host === socket.request.user.username) {
			
			//Get the socket of the target
			socketOfTarget = null;
			for(var i = 0; i < thisRoom.allSockets.length; i++){
				if(username === thisRoom.allSockets[i].request.user.username){
					socketOfTarget = thisRoom.allSockets[i];
				}
			}

			//Make them stand up forcefully
			thisRoom.playerStandUp(socketOfTarget);
			

			// Add to kickedPlayers array
			this.kickedPlayers.push(username.toLowerCase());
			var kickMsg = "Player " + username + " has been kicked by " + this.host + ".";
			this.sendText(this.socketsSittingDown, kickMsg, "server-text");
			// console.log(kickMsg);
			this.updateRoomPlayers();
		}
	}

	this.setClaim = function(socket, data){
		//data presents whether they want to CLAIM (true) or UNCLAIM (false)

		username = socket.request.user.username;

		index = thisRoom.claimingPlayers.indexOf(username);

		// If they want to claim and also don't exist on the claimingPlayers array
		if(data === true && index === -1){
			this.claimingPlayers.push(username);
		}
		// If they want to unclaim and also do exist on the claimingPlayers array
		else if(data === false){
			this.claimingPlayers.splice(index, 1);
		}

		thisRoom.updateRoomPlayers();
	}

    
    
    //Note this sends text to ALL players and ALL spectators
    this.sendText = function(sockets, incString, stringType) {
        data = {
            message: incString,
            classStr: stringType,
            dateCreated: new Date()
        };
        for (var i = 0; i < this.allSockets.length; i++) {
            this.allSockets[i].emit("roomChatToClient", data);
        }
    }

    this.updateRoomPlayers = function(){
		//Get the usernames of spectators
		var usernamesOfSpecs = [];
		var socketsOfSpectators = this.getSocketsOfSpectators();
		socketsOfSpectators.forEach(function(sock){
			usernamesOfSpecs.push(sock.request.user.username);
		});
		//Sort the usernames
		usernamesOfSpecs.sort(function(a, b) {
			var textA = a.toUpperCase();
			var textB = b.toUpperCase();
			return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
		});

		//Send the data to all sockets within the room.
		for(var i = 0; i < this.allSockets.length; i++){
			if(this.allSockets[i]){
				this.allSockets[i].emit("update-room-players", this.getRoomPlayers());
				this.allSockets[i].emit("update-room-spectators", usernamesOfSpecs);
				this.allSockets[i].emit("update-room-info", {maxNumPlayers: this.maxNumPlayers});
			}
		}
    }
	
	this.getRoomPlayers = function () {
		var roomPlayers = [];

		for (var i = 0; i < this.socketsSittingDown.length; i++) {

			var isClaiming;
			//If the player's username exists on the list of claiming:
			if(thisRoom.claimingPlayers.indexOf(thisRoom.socketsSittingDown[i].request.user.username) !== -1){
				isClaiming = true;
			}
			else{
				isClaiming = false;
			}
			

			roomPlayers[i] = {
				username: this.socketsSittingDown[i].request.user.username,
				avatarImgRes: this.socketsSittingDown[i].request.user.avatarImgRes,
				avatarImgSpy: this.socketsSittingDown[i].request.user.avatarImgSpy,
				avatarHide: this.socketsSittingDown[i].request.user.avatarHide,
				claim: isClaiming
			}

			//give the host the teamLeader star
			if (roomPlayers[i].username === this.host) {
				roomPlayers[i].teamLeader = true;
			}
		}
		
		return roomPlayers;
	};

    this.getSocketsOfSpectators = function(){
		//slice to create a new complete copy of allSOckets
		var socketsOfSpecs = this.allSockets.slice();
		
		// If there is a socket that is sitting down within the socketsOfSpecs (which was at first a clone of allSockets)
		// then remove that socket. Do this for all socketsSittingDown
		for(var i = 0; i < this.socketsSittingDown.length; i++){
			var index = socketsOfSpecs.indexOf(this.socketsSittingDown[i]);	
			if(index !== -1){
				socketsOfSpecs.splice(index, 1);
			}
		}

		return socketsOfSpecs;
    }
    
    this.updateMaxNumPlayers = function(socket, number){
		if(socket.request.user.username === thisRoom.host && number >= 5 && number <= 10){
			thisRoom.maxNumPlayers = number;
			thisRoom.updateRoomPlayers();
		}
    }
}



function getIndexFromUsername(sockets, username) {
	for (var i = 0; i < sockets.length; i++) {
		if (username === sockets[i].request.user.username) {
			return i;
		}
	}
}

function getUsernameFromIndex(usernames, index) {
	return usernames[index].username;
}




module.exports = Room;