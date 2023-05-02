import mongoose from 'mongoose';
import eloConstants from '../elo/constants/eloConstants';

// SCHEMA SETUP
const rankDataSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    seasonNumber: {
        type: Number,
    },
    playerRating: {
        type: Number,
        default: eloConstants.DEFAULTRATING,
    },
    rd: {
        type: Number,
        default: eloConstants.DEFAULTRD,
    },
    volatility: {
        type: Number,
        default: eloConstants.DEFAULTVOL,
    },

});
// compile schema into a model
const rankData = mongoose.model('rankData', rankDataSchema);

export default rankData;
