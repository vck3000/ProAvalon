const mongoose = require('mongoose');

// SCHEMA SETUP
const notificationSchema = new mongoose.Schema({

    text: String,
    date: Date,
    link: String,

    forPlayer: String,
    seen: Boolean,
    madeBy: String,

});
// compile schema into a model
const notification = mongoose.model('notification', notificationSchema);

module.exports = notification;
