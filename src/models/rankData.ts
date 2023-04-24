import mongoose from 'mongoose';

// SCHEMA SETUP
const rankDataSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    seasonNumber:{
        type: Number,
    },
    playerRating: {
        type: Number,
        default: 1500,
    },
    rd: {
        type: Number,
        default: 350,
    },
    volatility: {
        type: Number,
        default: 0.06,
    },

});
// compile schema into a model
const rankData = mongoose.model('rankData', rankDataSchema);

export default rankData;
