var mongoose = require("mongoose");

//SCHEMA SETUP
var statsCumulativeSchema = new mongoose.Schema({
    data: String
});
//compile schema into a model
var statsCumulative = mongoose.model("statsCumulative", statsCumulativeSchema);

module.exports = statsCumulative;