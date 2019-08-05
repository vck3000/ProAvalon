var mongoose = require("mongoose");

//SCHEMA SETUP
var patreonInfoTempSchema = new mongoose.Schema({
	name: String,
	serialized: String,
	token: String,

	patreon_full_name: String,
	patreon_id: String,
	patreon_amount_cents: String,
	patreon_declined_since: String
});
//compile schema into a model
var patreonInfoTemp = mongoose.model("patreonInfoTemp", patreonInfoTempSchema);

module.exports = patreonInfoTemp;