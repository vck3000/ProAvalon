var mongoose = require("mongoose");

//SCHEMA SETUP
var forumThreadSchema = new mongoose.Schema({
	title: String,
	// price: String,
	// image: String,
	description: String,
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
	]
});
//compile schema into a model
var forumThread = mongoose.model("Campground", forumThreadSchema);

module.exports = forumThread;