var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
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

	replies: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "ForumThreadCommentReply"
		} 
	],
});

module.exports = mongoose.model("ForumThreadComment", commentSchema);