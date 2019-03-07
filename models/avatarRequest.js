var mongoose = require("mongoose");

var avatarRequestSchema = new mongoose.Schema({

	forUsername: String,

	resLink: String,
	spyLink: String,

	dateRequested: Date,

	dateProcessed: Date,
	modWhoProcessed: String,

	processed: Boolean,

	modComment: String,
	approved: Boolean
});

module.exports = mongoose.model("AvatarRequest", avatarRequestSchema);