var mongoose = require("mongoose");

//SCHEMA SETUP
var banIpSchema = new mongoose.Schema({
	type: String, //ban, mute?
	
	bannedIp: String,
    
    modWhoBanned: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
    },

	whenMade: Date,
	
	usernamesAssociated: [String]
});

//compile schema into a model
var banIp = mongoose.model("BanIp", banIpSchema);

module.exports = banIp;