function matchBracket(rating, totalRankedGamesPlayed) {
    const provisionalGames = 20;
    const bronzeBase = 1300;
    const silverBase = 1400;
    const goldBase = 1550;
    const platBase = 1700;
    const diamondBase = 1800;
    const championBase = 1900;

    if (totalRankedGamesPlayed < provisionalGames) {
        return 'Unranked';
    } else if (rating < bronzeBase) {
        return 'Iron';
    } else if (rating >= bronzeBase && rating < silverBase) {
        return 'Bronze';
    } else if (rating >= silverBase && rating < goldBase) {
        return 'Silver';
    } else if (rating >= goldBase && rating < platBase) {
        return 'Gold';
    } else if (rating >= platBase && rating < diamondBase) {
        return 'Platinum';
    } else if (rating >= diamondBase && rating < championBase) {
        return 'Diamond';
    } else if (rating >= championBase) {
        return 'Champion';
    }
}

export default matchBracket;