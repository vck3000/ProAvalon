var avalonRoom = require("./avalonRoom.js");


var players = ["Michael", "George", "Jasmine", "Victor", "Grace", "newPlayer"];
var socketIds = [
"a",
"b",
"c",
"d",
"e",
"f",
];

var host = "Michael";

var room = new avalonRoom(host);

// console.log("roomTestTrue was: " + room.testTrue());

// if(room.testTrue() === true){
// 	console.log("testTrue was trueasdfasdf");
// }

room.startGame(players, socketIds);

console.log(room.getPlayers());