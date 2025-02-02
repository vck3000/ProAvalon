// TODO-kev: Delete this file. Purely for testing purposes

import { Command } from '../types';
import { SocketUser } from '../../types';
import dbAdapter from '../../../databaseAdapters';
import { sendReplyToCommand } from '../../sockets';
import { ISeason } from '../../../models/types/season';
import { RatingBracket } from '../../../databaseAdapters/mongoose/season';
import { Alliance } from '../../../gameplay/types';
import { ISeasonRole, Role } from '../../../gameplay/roles/types';

export const acreateseason: Command = {
  command: 'acs',
  help: '/acs <name>: Creates a new season',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length != 2) {
      sendReplyToCommand(socket, 'Please include the season name.');
      return;
    }

    const seasonName = args[1];
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 3); // 3 months

    // TODO-kev: Consider where to place this
    const ratingBrackets: RatingBracket[] = [
      { name: 'iron', min: 0, max: 1299 }, // Lower limit set at 0
      { name: 'bronze', min: 1300, max: 1399 },
      { name: 'silver', min: 1400, max: 1549 },
      { name: 'gold', min: 1550, max: 1699 },
      { name: 'platinum', min: 1700, max: 1799 },
      { name: 'diamond', min: 1800, max: 1899 },
      { name: 'champion', min: 1900, max: Infinity }, // Must have no upper limit
    ];

    const gameMode = '6p';

    const rolesAvailable: ISeasonRole[] = [
      {
        name: Role.Merlin,
        alliance: Alliance.Resistance,
      },
      {
        name: Role.Morgana,
        alliance: Alliance.Spy,
      },
      {
        name: Role.Percival,
        alliance: Alliance.Resistance,
      },
      {
        name: Role.Assassin,
        alliance: Alliance.Spy,
      },
      {
        name: Role.Resistance,
        alliance: Alliance.Resistance,
      },
    ];

    try {
      const newSeason: ISeason = await dbAdapter.season.createSeason(
        seasonName,
        startDate,
        endDate,
        ratingBrackets,
        gameMode,
        rolesAvailable,
      );
      const message = `Created new season: ${dbAdapter.season.formatSeason(
        newSeason,
      )}`;

      sendReplyToCommand(socket, message);
    } catch (error) {
      sendReplyToCommand(socket, error.message);
      return;
    }
  },
};
