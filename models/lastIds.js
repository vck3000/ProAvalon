const mongoose = require('mongoose');

// SCHEMA SETUP
const lastIdsSchema = new mongoose.Schema({
    number: Number,
});

// compile schema into a model
const lastIds = mongoose.model('lastIds', lastIdsSchema);

module.exports = lastIds;
