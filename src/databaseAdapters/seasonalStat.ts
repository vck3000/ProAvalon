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
  ): Promise<void>;
}

class MongoSeasonalStatAdapter implements DatabaseAdapter {
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
  ): Promise<void> {
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
  }
}

const seasonalStatAdapter = new MongoSeasonalStatAdapter();
export default seasonalStatAdapter;
