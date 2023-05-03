import eloConstants from "../constants/eloConstants";

function matchBracket(rating, totalRankedGamesPlayed) {
    if (totalRankedGamesPlayed < eloConstants.PROVISIONGAMES) {
        return 'Unranked';
    } else if (rating < eloConstants.BRONZEBASE) {
        return 'Iron';
    } else if (rating >= eloConstants.BRONZEBASE && rating < eloConstants.SILVERBASE) {
        return 'Bronze';
    } else if (rating >= eloConstants.SILVERBASE && rating < eloConstants.GOLDBASE) {
        return 'Silver';
    } else if (rating >= eloConstants.GOLDBASE && rating < eloConstants.PLATINUMBASE) {
        return 'Gold';
    } else if (rating >= eloConstants.PLATINUMBASE && rating < eloConstants.DIAMONDBASE) {
        return 'Platinum';
    } else if (rating >= eloConstants.DIAMONDBASE && rating < eloConstants.CHAMPIONBASE) {
        return 'Diamond';
    } else {
        return 'Champion';
    }
}

export default matchBracket;