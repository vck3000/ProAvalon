var mongoose = require("mongoose");

//SCHEMA SETUP
var forumThreadSchema = new mongoose.Schema({
	title: String,
	// price: String,
	// image: String,
	description: String,
	timeCreated: Date,
	
	likes: String,
	numOfComments: String,
	timeLastEdit: String,

	numberId: Number,
	

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
			ref: "Comment"
		} 
	],

	category: String
});
//compile schema into a model
var forumThread = mongoose.model("forumThread", forumThreadSchema);

module.exports = forumThread;