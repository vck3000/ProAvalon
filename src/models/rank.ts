import mongoose from 'mongoose';
import eloConstants from '../elo/constants/eloConstants';

// SCHEMA SETUP
const rankSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    seasonNumber: {
        type: Number,
    },
    leavePenalty:{
        type: Number,
        default: 0,
    },
    playerRating: {
        type: Number,
        default: eloConstants.DEFAULT_RATING,
    },
    rd: {
        type: Number,
        default: eloConstants.DEFAULT_RD,
    },
    volatility: {
        type: Number,
        default: eloConstants.DEFAULT_VOL,
    },

});
// compile schema into a model
const rank = mongoose.model('rank', rankSchema);

export default rank;
