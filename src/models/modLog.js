const mongoose = require('mongoose');

// SCHEMA SETUP
const modLogSchema = new mongoose.Schema({
    type: String,
    modWhoMade: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        username: String,
        usernameLower: String
    },
    data: Object,

    dateCreated: Date
});

// compile schema into a model
const modLog = mongoose.model('ModLog', modLogSchema);

module.exports = modLog;
