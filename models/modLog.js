const mongoose = require("mongoose");

// SCHEMA SETUP
const modLogSchema = new mongoose.Schema({
    type: String, // ban, mute? avatar approve?
    modWhoMade: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        username: String,
    },
    description: String,

    dateCreated: Date,
});

// compile schema into a model
const modLog = mongoose.model("ModLog", modLogSchema);

module.exports = modLog;
