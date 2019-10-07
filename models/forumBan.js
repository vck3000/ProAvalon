const mongoose = require('mongoose');

// SCHEMA SETUP
const ForumBanSchema = new mongoose.Schema({
    type: String, // ban, mute?

    bannedPlayer: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        username: String,
        usernameLower: String,
    },


    modWhoBanned: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        username: String,
    },

    reason: String,

    whenMade: Date,

    descriptionByMod: String,
    originalContent: String,

    idOfReply: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumThreadCommentReply',
    },
    idOfComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumThreadComment',
    },
    idOfForum: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumThread',
    },
    elementDeleted: String,
});

// compile schema into a model
const ForumBan = mongoose.model('ForumBan', ForumBanSchema);

module.exports = ForumBan;
