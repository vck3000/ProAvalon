const mongoose = require('mongoose');

// SCHEMA SETUP
const patreonIdSchema = new mongoose.Schema({
    name: String,
    token: String,
    id: String,
    amount_cents: String,
    declined_since: String,
    expires: Date,
    in_game_username: String,
});
// compile schema into a model
const patreonId = mongoose.model('patreonId', patreonIdSchema);

module.exports = patreonId;
