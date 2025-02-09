import { IUserSeasonStat } from '../../models/types/userSeasonStat';
import UserSeasonStat from '../../models/userSeasonStat';
import IUserSeasonStatDbAdapter from '../databaseInterfaces/userSeasonStat';
import { Role } from '../../gameplay/gameEngine/roles/types';
import Season from '../../models/season';
import { getRatingBracket } from '../../gameplay/elo/ratingBrackets';

export class MongoUserSeasonStatAdapter implements IUserSeasonStatDbAdapter {
  async findOrCreateStat(
    userId: string,
    seasonId: string,
  ): Promise<IUserSeasonStat> {
    let stat = await UserSeasonStat.findOne({
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
    ratingChange: number, // TODO-kev: Consider if we pass in the new rating instead + ratingBracket
    numPlayers: number,
    role: Role,
  ): Promise<IUserSeasonStat> {
    if (numPlayers < 5 || numPlayers > 10) {
      throw new Error(`Invalid number of players: ${numPlayers}`);
    }

    if (!Object.values(Role).includes(role)) {
      throw new Error(`Invalid role received: ${role}"`);
    }

    const stat = await UserSeasonStat.findById(userSeasonStat.id);

    // Initialise roleStats object if not present
    if (!stat.roleStats[`${numPlayers}p`]) {
      stat.roleStats[`${numPlayers}p`] = {};
    }

    if (!stat.roleStats[`${numPlayers}p`][role]) {
      stat.roleStats[`${numPlayers}p`][role] = {
        gamesPlayed: 0,
        gamesWon: 0,
      };
    }

    stat.rankedGamesPlayed += 1;
    stat.roleStats[`${numPlayers}p`][role].gamesPlayed += 1;

    if (isWin) {
      stat.rankedGamesWon += 1;
      stat.roleStats[`${numPlayers}p`][role].gamesWon += 1;
    }

    stat.markModified('roleStats');

    stat.winRate = stat.rankedGamesWon / stat.rankedGamesPlayed;

    const updatedRating = stat.rating + ratingChange;
    stat.rating = Math.max(updatedRating, 0);
    stat.highestRating = Math.max(stat.highestRating, updatedRating);

    // TODO-kev: Consider if this is the best way
    const season = await Season.findById(stat.seasonId);
    stat.ratingBracket = getRatingBracket(stat.rating, season.ratingBrackets);

    stat.lastUpdated = new Date();

    await stat.save();

    return stat;
  }
}

export function stringifyUserSeasonStat(stat: IUserSeasonStat) {
  return `
      rating=${stat.rating},
      highestRating=${stat.highestRating}, 
      ratingBracket=${stat.ratingBracket},
      rankedGamesPlayed=${stat.rankedGamesPlayed}, 
      rankedGamesWon=${stat.rankedGamesWon},
      winRate=${stat.winRate}, 
      lastUpdated=${stat.lastUpdated}, 
    `;
}
