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
});

module.exports = mongoose.model("forumThreadCommentReply", replySchema);