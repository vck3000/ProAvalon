var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	avatarImgRes: String,
	avatarImgSpy: String,

	dateJoined: Date,
	totalSecondsPlayed: Date,


	totalGamesPlayed: Number,

	
	totalWins: Number,
	totalLosses: Number,
	

	nationality: String,
	timeZone: String,
	biography: String,

	
	//dont need to worry about roleWins growing out of control
	//since there are a limited amount of roles, and each role 
	//only has one Number attached to it
	roleStats: Object,

	notifications: Object


});


UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);




/*

roleStats: {
	"merlin": {
		"5": {
			"wins": 15,
			"losses": 8
		},

		"6": {

		},
	}

	
}


*/