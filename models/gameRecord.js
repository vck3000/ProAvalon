var mongoose = require("mongoose");

//SCHEMA SETUP
var gameRecordSchema = new mongoose.Schema({

	timeGameStarted: Date, 
	timeAssassinationStarted: Date,
	timeGameFinished: Date,
	winningTeam: String,
	spyTeam: [String],
	resistanceTeam: [String],

	gameMode: String,

	numberOfPlayers: Number,
	//E.g. mission fails, mission suceeds and dodge bullet, assassination
	howTheGameWasWon: String,
	whoAssassinShot: String,
	roles: [String],

	ladyChain: [String],
	ladyHistoryUsernames: [String],

	sireChain: [String],
	sireHistoryUsernames: [String],

	missionHistory: [String],
	voteHistory: Object,
	playerRoles: Object,

	moreThanOneFailMissions: [Boolean]
	
});
//compile schema into a model
var gameRecord = mongoose.model("gameRecord", gameRecordSchema);

module.exports = gameRecord;