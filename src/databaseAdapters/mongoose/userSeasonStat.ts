import { IUserSeasonStat } from '../../models/types/userSeasonStat';
import UserSeasonStat from '../../models/userSeasonStat';
import IUserSeasonStatDbAdapter from '../databaseInterfaces/userSeasonStat';
import { Role } from '../../gameplay/gameEngine/roles/types';
import { RatingBracketName } from '../../gameplay/elo/ratingBrackets';

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
    rating: number,
    ratingBracket: RatingBracketName,
    numPlayers: number,
    role: Role,
  ): Promise<IUserSeasonStat> {
    // Validate inputs
    if (numPlayers < 5 || numPlayers > 10) {
      throw new Error(`Invalid number of players: ${numPlayers}`);
    }

    if (!Object.values(Role).includes(role)) {
      throw new Error(`Invalid role received: ${role}"`);
    }

    if (rating < 0) {
      throw new Error(
        `Rating must be greater than or equal to 0. Received: ${rating}`,
      );
    }

    if (!Object.values(RatingBracketName).includes(ratingBracket)) {
      throw new Error(`Invalid rating bracket received: ${ratingBracket}`);
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

    // Update stats
    stat.rankedGamesPlayed += 1;
    stat.roleStats[`${numPlayers}p`][role].gamesPlayed += 1;

    if (isWin) {
      stat.rankedGamesWon += 1;
      stat.roleStats[`${numPlayers}p`][role].gamesWon += 1;
    }

    stat.markModified('roleStats');

    stat.winRate = stat.rankedGamesWon / stat.rankedGamesPlayed;

    stat.rating = rating;
    stat.highestRating = Math.max(stat.highestRating, rating);
    stat.ratingBracket = ratingBracket;

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
