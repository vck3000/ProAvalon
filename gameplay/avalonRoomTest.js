var avalonRoom = require("./avalonRoom.js");


players = ["Michael", "George", "Jasmine", "Victor", "Grace"];

var room = new avalonRoom(players);

// console.log("roomTestTrue was: " + room.testTrue());

// if(room.testTrue() === true){
// 	console.log("testTrue was trueasdfasdf");
// }

room.startGame(players);

console.log(room.getPlayers());
console.log(room.getPlayers().role);