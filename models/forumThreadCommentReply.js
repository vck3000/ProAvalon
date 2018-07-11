var mongoose = require("mongoose");

var replySchema = mongoose.Schema({
	text: String,

	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},

	timeCreated: Date,
	timeLastEdit: Date,
	likes: String,
	edited: Boolean,

	replyingUsername: String




});

module.exports = mongoose.model("ForumThreadCommentReply", replySchema);