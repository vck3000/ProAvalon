var mongoose = require("mongoose");

var replySchema = new mongoose.Schema({
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
	likes: Number,
	whoLikedId: [],
	edited: Boolean,

	replyingUsername: String




});

module.exports = mongoose.model("ForumThreadCommentReply", replySchema);