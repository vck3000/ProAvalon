
var host;
var leaderOfRoom;
var players;



var Room(currentUser) = {
	//set up variables
	host = currentUser;
	leaderOfRoom = currentUser;

	players = [currentUser];

};



module.exports = room;