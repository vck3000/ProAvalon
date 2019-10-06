const mongoose = require('mongoose');

// SCHEMA SETUP
const banSchema = new mongoose.Schema({
    
    userBan: Boolean,
    ipBan: Boolean,
    singleIPBan: Boolean,

    bannedPlayer: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        username: String,
        usernameLower: String,
    },
    
    bannedIPs: [String],

    modWhoBanned: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        username: String,
        usernameLower: String,
    },

    whenMade: Date,
    durationToBan: String,
    whenRelease: Date,

    descriptionByMod: String,
    reason: String,

    disabled: {
        type: Boolean,
        default: false
    },

    disabledBy: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        username: String,
        usernameLower: String,
    }
    
});

// compile schema into a model
const ban = mongoose.model('Ban', banSchema);

module.exports = ban;
