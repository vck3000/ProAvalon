const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    usernameLower: String,
    password: {
        type: String,
        // Not sure exactly how passportjs handles this,
        // but we don't give this parameter to Mongoose when creating.
        // required: true,
    },

    avatarImgRes: {
        type: String,
        default: null,
    },
    avatarImgSpy: {
        type: String,
        default: null,
    },
    avatarHide: Boolean,

    hideStats: Boolean,

    dateJoined: Date,
    totalTimePlayed: {
        type: Date,
        default: 0,
    },

    totalGamesPlayed: {
        type: Number,
        default: 0,
    },

    totalWins: {
        type: Number,
        default: 0,
    },
    totalResWins: {
        type: Number,
        default: 0,
    },
    totalLosses: {
        type: Number,
        default: 0,
    },
    totalResLosses: {
        type: Number,
        default: 0,
    },

    winsLossesGameSizeBreakdown: {
        type: Object,
        default: {},
    },

    nationality: {
        type: String,
        default: '',
    },
    nationCode: {
        type: String,
        default: '',
    },
    timeZone: {
        type: String,
        default: '',
    },
    biography: {
        type: String,
        default: '',
    },


    // dont need to worry about roleWins growing out of control
    // since there are a limited amount of roles, and each role
    // only has one Number attached to it
    roleStats: {
        type: Object,
        default: {
            '5p': {
                merlin: {

                },
                percival: {

                },
                assassin: {

                },
                morgana: {

                },
                spy: {

                },
                resistance: {

                },
            },
        },
    },

    notifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'notification',
    }],


    modAction: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ModAction',
    }],

    mutedPlayers: [String],

    patreonId: String,
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
