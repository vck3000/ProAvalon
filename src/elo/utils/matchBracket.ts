import { eloConstants, rankBracket } from "../constants/eloConstants";

function matchBracket(rating:number, totalRankedGamesPlayed:number) {
    if (totalRankedGamesPlayed < eloConstants.PROVISION_GAMES) {
        return 'Unranked';
    } else if (rating < rankBracket.BRONZE_BASE) {
        return 'Iron';
    } else if (rating < rankBracket.SILVER_BASE) {
        return 'Bronze';
    } else if (rating < rankBracket.GOLD_BASE) {
        return 'Silver';
    } else if (rating < rankBracket.PLATINUM_BASE) {
        return 'Gold';
    } else if (rating < rankBracket.DIAMOND_BASE) {
        return 'Platinum';
    } else if (rating < rankBracket.CHAMPION_BASE) {
        return 'Diamond';
    } else {
        return 'Champion';
    }
}

export default matchBracket;