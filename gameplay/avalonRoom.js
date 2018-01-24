//avalon room object

var playersInGame = [];
var player = [];

var host;

var roles = [
"Merlin",
"Percival",
"Resistance",

"Morgana",
"Assassin",
"Spy"
];

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


module.exports = function(host_){
	//Just to know who is the current host.
	host = host_;

	//start game
	this.startGame = function(players){

		var playersYetToInitialise = [];
		var rolesAssignment = [];
		for(var i = 0; i < players.length; i++){
			playersYetToInitialise[i] = players[i];
			rolesAssignment[i] = i;
		}

		console.log(rolesAssignment);
		var rolesAssignment = shuffle(rolesAssignment);
		console.log(rolesAssignment);


		//initialise roles
		for(var i = 0; i < players.length; i++){
			
			//Need a merlin:
			// console.log(getRandomInt(0,playersYetToInitialise.length));

			var num = getRandomInt(0,playersYetToInitialise.length);



			playersInGame[i] = [];
			playersInGame[i].username = players[i];
			playersInGame[i].role = "spy";
			console.log("add");

		}
	};


	this.testFunction = function(){
		console.log("test asdf asdf");
	};

	this.testTrue = function(){
		return true;
	};

	this.getPlayers = function(){
		return playersInGame;
	};



};