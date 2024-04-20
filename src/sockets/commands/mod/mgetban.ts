import { Command } from '../types';
import Ban from '../../../models/ban';
import moment from 'moment';

export const mgetban: Command = {
  command: 'mgetban',
  help: '/mgetban <username>: Find the players latest active ban that would be undone by /munban.',
  run: async (args, senderSocket) => {
    if (!args[1]) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Specify a username.',
        classStr: 'server-text',
      });
      return;
    }

    const ban = await Ban.findOne({
      'bannedPlayer.usernameLower': args[1].toLowerCase(),
      whenRelease: { $gt: new Date() },
      disabled: false,
    }).sort({ whenMade: 'descending' });

    if (ban) {
      const dataToReturn = [];
      dataToReturn[0] = {
        message: `Ban details for ${ban.bannedPlayer.username}:`,
        classStr: 'server-text',
        dateCreated: new Date(),
      };

      dataToReturn.push({
        message: `Ban made by: ${ban.modWhoBanned.username}`,
        classStr: 'server-text',
        dateCreated: new Date(),
      });
      dataToReturn.push({
        message: `Ban made on: ${moment(ban.whenMade).format('LLL')}.`,
        classStr: 'server-text',
        dateCreated: new Date(),
      });
      dataToReturn.push({
        message: `Ban duration: ${ban.durationToBan}`,
        classStr: 'server-text',
        dateCreated: new Date(),
      });
      dataToReturn.push({
        message: `Ban to be released on: ${moment(ban.whenRelease).format(
          'LLL',
        )}.`,
        classStr: 'server-text',
        dateCreated: new Date(),
      });
      dataToReturn.push({
        message: `Mod description: ${ban.descriptionByMod}`,
        classStr: 'server-text',
        dateCreated: new Date(),
      });
      dataToReturn.push({
        message: `User ban: ${ban.userBan}`,
        classStr: 'server-text',
        dateCreated: new Date(),
      });
      dataToReturn.push({
        message: `IP ban: ${ban.ipBan}`,
        classStr: 'server-text',
        dateCreated: new Date(),
      });
      dataToReturn.push({
        message: `Single IP ban: ${ban.singleIPBan}`,
        classStr: 'server-text',
        dateCreated: new Date(),
      });
      senderSocket.emit('messageCommandReturnStr', dataToReturn);
    } else {
      senderSocket.emit('messageCommandReturnStr', {
        message: `Could not find an active ban for ${args[1]}.`,
        classStr: 'server-text',
      });
    }
  },
};
