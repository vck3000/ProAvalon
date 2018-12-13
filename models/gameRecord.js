var mongoose = require("mongoose");

//SCHEMA SETUP
var gameRecordSchema = new mongoose.Schema({

	timeGameStarted: Date, 
	timeAssassinationStarted: Date,
	timeGameFinished: Date,
	winningTeam: String,
	spyTeam: [String],
	resistanceTeam: [String],

	gameMode: String, //Avalon? Original? Hunter?
	numberOfPlayers: Number,
	//E.g. mission fails, mission suceeds and dodge bullet, assassination
    howTheGameWasWon: String,
    // Two of them for Tristan / Isolde
	whoAssassinShot: String,
	whoAssassinShot2: String,
	
	roles: [String],
	cards: [String],

	ladyChain: [String],
	ladyHistoryUsernames: [String],
	
	refChain: [String],
	refHistoryUsernames: [String],

	sireChain: [String],
	sireHistoryUsernames: [String],

	missionHistory: [String],
	voteHistory: Object,
	playerRoles: Object,

    moreThanOneFailMissions: [Boolean],
    
    chatHistory: String
});
//compile schema into a model
var gameRecord = mongoose.model("gameRecord", gameRecordSchema);

module.exports = gameRecord;