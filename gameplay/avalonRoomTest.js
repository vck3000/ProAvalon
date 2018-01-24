var avalonRoom = require("./avalonRoom.js");


players = ["michael", "George", "Jasmine", "Victor", "Grace"];

var room = new avalonRoom(players);

console.log("roomTestTrue was: " + room.testTrue());

if(room.testTrue() === true){
	console.log("testTrue was trueasdfasdf");
}

console.log(room.getPlayers());