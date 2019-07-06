var mongoose = require("mongoose");

//SCHEMA SETUP
var modLogSchema = new mongoose.Schema({
    type: String, //ban, mute? avatar approve?
    modWhoMade: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    description: String,

    dateCreated: Date,
});

//compile schema into a model
var modLog = mongoose.model("ModLog", modLogSchema);

module.exports = modLog;