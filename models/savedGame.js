var mongoose = require("mongoose");

//SCHEMA SETUP
var savedGameSchema = new mongoose.Schema({
    room: String
});
//compile schema into a model
var savedGame = mongoose.model("savedGame", savedGameSchema);

module.exports = savedGame;