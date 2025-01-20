import { ISeasonalStat } from '../models/types/seasonalStats.types';
import { Types } from 'mongoose';
import SeasonalStats from '../models/seasonalStats';

interface DatabaseAdapter {
  getStat(
    userId: Types.ObjectId,
    seasonId: Types.ObjectId,
  ): Promise<ISeasonalStat>;
  updateStat(
    userId: Types.ObjectId,
    seasonId: Types.ObjectId,
    isWin: boolean,
    ratingChange: number,
  ): Promise<ISeasonalStat>;
}

class MongoSeasonalStatAdapter implements DatabaseAdapter {
  // TODO-kev: Delete below after usage
  parseSeasonalStat(stat: ISeasonalStat): string {
    const winRateFormatted = (stat.winRate * 100).toFixed(2) + '%';

    return `
      rating=${stat.rating},
      highestRating=${stat.highestRating}, 
      ratingBracket=${stat.ratingBracket},
      rankedGamesPlayed=${stat.rankedGamesPlayed}, 
      rankedGamesWon=${stat.rankedGamesWon}, 
      rankedGamesLost=${stat.rankedGamesLost}, 
      winRate=${winRateFormatted}, 
      lastUpdated=${stat.lastUpdated}, 
    `;
  }

  async getStat(
    userId: Types.ObjectId,
    seasonId: Types.ObjectId,
  ): Promise<ISeasonalStat> {
    let stat: ISeasonalStat = await SeasonalStats.findOne({
      user: userId,
      season: seasonId,
    });

    // TODO-kev: Consider how the user stat should be prefilled across resets
    if (!stat) {
      stat = await SeasonalStats.create({
        user: userId,
        season: seasonId,
        lastUpdated: new Date(),
      });
    }

    return stat;
  }

  async updateStat(
    userId: Types.ObjectId,
    seasonId: Types.ObjectId,
    isWin: boolean,
    ratingChange: number,
  ): Promise<ISeasonalStat> {
    const stat: ISeasonalStat = await SeasonalStats.findOne({
      user: userId,
      season: seasonId,
    });

    stat.rankedGamesPlayed += 1;

    if (isWin) {
      stat.rankedGamesWon += 1;
    } else {
      stat.rankedGamesLost += 1;
    }

    stat.winRate = stat.rankedGamesWon / stat.rankedGamesPlayed;

    stat.rating += ratingChange;
    stat.ratingBracket = 'Silver'; // TODO-kev: Update this part

    stat.lastUpdated = new Date();

    await stat.save();

    return stat;
  }
}

const seasonalStatAdapter = new MongoSeasonalStatAdapter();
export default seasonalStatAdapter;
