var mongoose = require("mongoose");

//SCHEMA SETUP
var forumThreadSchema = new mongoose.Schema({
	title: String,
	// price: String,
	// image: String,
	description: String,
	timeCreated: Date,
	
	likes: Number,
	whoLikedId: [],
	numOfComments: Number,
	hoursSinceLastEdit: String,
	timeLastEdit: Date,

	numberId: Number,

	edited: Boolean,
	

	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "ForumThreadComment"
		} 
	],

	category: String
});
//compile schema into a model
var forumThread = mongoose.model("ForumThread", forumThreadSchema);

module.exports = forumThread;