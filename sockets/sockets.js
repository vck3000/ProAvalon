//sockets

var currentPlayers = [];
var allSockets = [];

var avalonRoom = require("../gameplay/avalonRoom");


module.exports = function(io){
	//SOCKETS for each connection
	io.sockets.on("connection", function(socket){

		if(socket.request.isAuthenticated()){
			console.log("User is authenticated");
		} else{
			console.log("User is not authenticated");
		}

		//if user is already logged in
		var i = currentPlayers.indexOf(socket.request.user.username);
		if(i !== -1){
			allSockets[socket.request.user.username].emit("alert", "You've been disconnected");
			allSockets[socket.request.user.username].disconnect();
			currentPlayers.splice(i, 1);
			console.log("User was logged in already, killed last session and socket.")
		}

		console.log(socket.request.user.username + " has connected under socket ID: " + socket.id);

		//automatically join the all chat
		socket.join("allChat");
		currentPlayers.push(socket.request.user.username);
		allSockets[socket.request.user.username] = socket;

		//socket sends to all except the user of this socket
		socket.in("allChat").emit("player-joined-lobby", socket.request.user.username);
		
		//io sends to everyone in the room, including the current user of this socket
		io.in("allChat").emit("update-current-players-list", currentPlayers);


		//when a user tries to send a message to all chat
		socket.on("allChatFromClient", function(data){
			//debugging
			console.log("incoming message at " + data.date + ": " + data.message + " by: " + socket.request.user);
			//get the username and put it into the data object
			data.username = socket.request.user.username;
			//send out that data object to all other clients (except the one who sent the message)
			socket.in("allChat").emit("allChatToClient", data);
		});

		//when a new room is created
		//INCOMPLETE
		socket.on("newRoom", function(data){
			// var room = new Room(socket.request.user);

			var room = new avalonRoom();
			room.testFunction();

			console.log("new room request");

			socket.in("allChat").emit("Room " + room.ID + " has been created! Go join!");
		});

		//when a user disconnects/leaves
		socket.on("disconnect",function(data){
			//debugging
			console.log(socket.request.user.username + " has left.");
			//get the index of the player in the array list
			var i = currentPlayers.indexOf(socket.request.user.username);
			//in case they already dont exist, dont crash server
			if(i === -1){return;}
			//remove that single player who left
			currentPlayers.splice(i, 1);
			//send out the new updated current player list
			socket.in("allChat").emit("update-current-players-list", currentPlayers);
			//tell all clients that the user has left
			socket.in("allChat").emit("player-left-lobby", socket.request.user.username);
		});

	});
}
