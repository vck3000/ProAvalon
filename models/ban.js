const mongoose = require('mongoose');

// SCHEMA SETUP
const banSchema = new mongoose.Schema({
    
    ipban: Boolean,
    userban: Boolean,

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
});

// compile schema into a model
const ban = mongoose.model('Ban', banSchema);

module.exports = ban;
