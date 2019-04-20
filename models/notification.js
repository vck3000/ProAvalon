var mongoose = require("mongoose");

//SCHEMA SETUP
var notificationSchema = new mongoose.Schema({

	text: String,
	date: Date,
	link: String,

	forPlayer: String,
    seen: Boolean,
    madeBy: String

});
//compile schema into a model
var notification = mongoose.model("notification", notificationSchema);

module.exports = notification;