//avalon room object

var playersInGame = [];




module.exports = function(players){

	playersInGame = players;


	this.testFunction = function(){
		console.log("test asdf asdf");
	}

	this.testTrue = function(){
		return true;
	}

	this.getPlayers = function(){
		return playersInGame;
	}



};