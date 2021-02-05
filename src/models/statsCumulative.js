const mongoose = require('mongoose');

// SCHEMA SETUP
const statsCumulativeSchema = new mongoose.Schema({
    data: String,
});
// compile schema into a model
const statsCumulative = mongoose.model('statsCumulative', statsCumulativeSchema);

module.exports = statsCumulative;
