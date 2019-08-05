var mongoose = require("mongoose");

//SCHEMA SETUP
var patreonInfoTempSchema = new mongoose.Schema({
	name: String,
	serialized: String,
	token: String,
});
//compile schema into a model
var patreonInfoTemp = mongoose.model("patreonInfoTemp", patreonInfoTempSchema);

module.exports = patreonInfoTemp;