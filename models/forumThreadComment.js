var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
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
	edited: Boolean,

	replies: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "forumThreadCommentReply"
		} 
	],
});

module.exports = mongoose.model("forumThreadComment", commentSchema);