const mongoose = require('mongoose');

// SCHEMA SETUP
const modActionSchema = new mongoose.Schema({
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

    durationToBan: Date,
    whenRelease: Date,

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
const modAction = mongoose.model('ModAction', modActionSchema);

module.exports = modAction;
