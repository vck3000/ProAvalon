const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    usernameLower: String,
    password: String,
    avatarImgRes: String,
    avatarImgSpy: String,

    avatarHide: Boolean,

    hideStats: Boolean,


    dateJoined: Date,
    totalTimePlayed: Date,


    totalGamesPlayed: Number,


    totalWins: Number,
    totalResWins: Number,
    totalLosses: Number,
    totalResLosses: Number,

    winsLossesGameSizeBreakdown: Object,

    nationality: String,
    nationCode: String,
    timeZone: String,
    biography: String,


    // dont need to worry about roleWins growing out of control
    // since there are a limited amount of roles, and each role
    // only has one Number attached to it
    roleStats: Object,

    notifications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "notification",
        },
    ],


    modAction: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ModAction",
        },
    ],

    mutedPlayers: [
        String,
    ],
});


UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
