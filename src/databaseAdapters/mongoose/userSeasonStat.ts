import { IRoleStat, IUserSeasonStat } from '../../models/types/userSeasonStat';
import UserSeasonStat from '../../models/userSeasonStat';
import IUserSeasonStatDbAdapter from '../databaseInterfaces/userSeasonStat';
import { Role } from '../../gameplay/gameEngine/roles/types';

export class MongoUserSeasonStatAdapter implements IUserSeasonStatDbAdapter {
  async findOrCreateStat(
    userId: string,
    seasonId: string,
  ): Promise<IUserSeasonStat> {
    let stat: IUserSeasonStat = await UserSeasonStat.findOne({
      userId,
      seasonId,
    });

    if (!stat) {
      stat = await UserSeasonStat.create({
        userId,
        seasonId,
      });

      console.log(`User season stat created: ${stringifyUserSeasonStat(stat)}`);
    }

    return stat;
  }

  async registerGameOutcome(
    userSeasonStat: IUserSeasonStat,
    isWin: boolean,
    ratingChange: number,
    role: Role,
  ): Promise<IUserSeasonStat> {
    const dbUserSeasonStat = await UserSeasonStat.findById(userSeasonStat.id);

    // TODO-kev: Update below if it doesnt exist
    const roleStat: IRoleStat = userSeasonStat.roleStats[role];

    dbUserSeasonStat.rankedGamesPlayed += 1;

    if (isWin) {
      dbUserSeasonStat.rankedGamesWon += 1;
      roleStat.gamesWon += 1;
    } else {
      dbUserSeasonStat.rankedGamesLost += 1;
      roleStat.gamesLost += 1;
    }

    dbUserSeasonStat.markModified('roleStats');

    dbUserSeasonStat.winRate =
      dbUserSeasonStat.rankedGamesWon / dbUserSeasonStat.rankedGamesPlayed;

    dbUserSeasonStat.rating += ratingChange;
    dbUserSeasonStat.ratingBracket = 'silver'; // TODO-kev: Update this part

    if (dbUserSeasonStat.rating > dbUserSeasonStat.highestRating) {
      dbUserSeasonStat.highestRating = dbUserSeasonStat.rating;
    }

    dbUserSeasonStat.lastUpdated = new Date();

    await dbUserSeasonStat.save();

    return userSeasonStat;
  }
}

export function stringifyUserSeasonStat(stat: IUserSeasonStat) {
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
