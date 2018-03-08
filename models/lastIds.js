var mongoose = require("mongoose");

//SCHEMA SETUP
var lastIdsSchema = new mongoose.Schema({
    number: Number,
});

//compile schema into a model
var lastIds = mongoose.model("lastIds", lastIdsSchema);

module.exports = lastIds;