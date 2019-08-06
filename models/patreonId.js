var mongoose = require("mongoose");

//SCHEMA SETUP
var patreonIdSchema = new mongoose.Schema({
	name: String,
	token: String,
	id: String,
	amount_cents: String,
	declined_since: String,
	expires: Date,
	in_game_username: String
});
//compile schema into a model
var patreonId = mongoose.model("patreonId", patreonIdSchema);

module.exports = patreonId;