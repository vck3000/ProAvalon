var mongoose = require("mongoose");

//SCHEMA SETUP
var notificationSchema = new mongoose.Schema({
	
	text: String,
	date: Date,

});
//compile schema into a model
var notification = mongoose.model("notification", notificationSchema);

module.exports = notification;