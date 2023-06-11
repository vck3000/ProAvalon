import {
  rankBracketConstants,
  rankGameConstants,
} from '../constants/rankConstants';

function getRankedBracket(rating: number, totalRankedGamesPlayed: number) {
  if (totalRankedGamesPlayed < rankGameConstants.PROVISION_GAMES) {
    return 'Unranked';
  } else if (rating >= rankBracketConstants.CHAMPION_BASE) {
    return 'Champion';
  } else if (rating >= rankBracketConstants.DIAMOND_BASE) {
    return 'Diamond';
  } else if (rating >= rankBracketConstants.PLATINUM_BASE) {
    return 'Platinum';
  } else if (rating >= rankBracketConstants.GOLD_BASE) {
    return 'Gold';
  } else if (rating >= rankBracketConstants.SILVER_BASE) {
    return 'Silver';
  } else if (rating >= rankBracketConstants.BRONZE_BASE) {
    return 'Bronze';
  } else {
    return 'Iron';
  }
}

export default getRankedBracket;
