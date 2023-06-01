import eloConstants from "../constants/eloConstants";

function matchBracket(rating:number, totalRankedGamesPlayed:number) {
    if (totalRankedGamesPlayed < eloConstants.PROVISION_GAMES) {
        return 'Unranked';
    } else if (rating < eloConstants.BRONZE_BASE) {
        return 'Iron';
    } else if (rating < eloConstants.SILVER_BASE) {
        return 'Bronze';
    } else if (rating < eloConstants.GOLD_BASE) {
        return 'Silver';
    } else if (rating < eloConstants.PLATINUM_BASE) {
        return 'Gold';
    } else if (rating < eloConstants.DIAMOND_BASE) {
        return 'Platinum';
    } else if (rating < eloConstants.CHAMPION_BASE) {
        return 'Diamond';
    } else {
        return 'Champion';
    }
}

export default matchBracket;