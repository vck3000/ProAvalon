import { Command } from '../types';
import IPLinkedAccounts from '../../../myFunctions/IPLinkedAccounts';
import User from '../../../models/user';
import ModLog from '../../../models/modLog';
import sanitizeHtml from 'sanitize-html';

export const miplinkedaccs: Command = {
  command: 'miplinkedaccs',
  help: '/miplinkedaccs <username> <num_levels (greater than 1 | defaults to 2)>: Finds all accounts that have shared the same IPs the specified user. Put anything in <fullTree> to see full tree.',
  async run(args, senderSocket) {
    const username = args[1];
    const num_levels = args[2] ? parseInt(args[2], 10) : 1;

    // Send out data in a readable way to the mod.
    const dataToReturn = [];

    if (isNaN(num_levels) || num_levels < 1) {
      dataToReturn[0] = {
        message: `${args[2]} is not a valid positive integer.`,
        classStr: 'server-text',
        dateCreated: new Date(),
      };
      senderSocket.emit('messageCommandReturnStr', dataToReturn);
      return;
    }

    let linkedUsernamesWithLevel;
    let usernamesTree;
    const newUsernamesTreeLines = [];
    try {
      const ret = await IPLinkedAccounts(username, num_levels);
      linkedUsernamesWithLevel = ret.linkedUsernamesWithLevel;
      usernamesTree = ret.usernamesTree;
    } catch (e) {
      senderSocket.emit('messageCommandReturnStr', {
        message: e.message,
        classStr: 'server-text',
        dateCreated: new Date(),
      });
      return;
    }

    if (linkedUsernamesWithLevel.length === 0) {
      dataToReturn[0] = {
        message: 'There are no users with matching IPs (weird).',
        classStr: 'server-text',
        dateCreated: new Date(),
      };
    } else {
      dataToReturn[0] = {
        message: '-------------------------',
        classStr: 'server-text',
        dateCreated: new Date(),
      };

      const lines = usernamesTree.split('\n');
      // Do my special replace white space with forced white space and append
      for (const line of lines) {
        let replace = true;
        let newLine = '';
        for (const ch of line) {
          if (ch == ' ' && replace) {
            newLine += '&#160;&#160;';
          } else if (!ch.match('/^[a-z0-9]+$/i')) {
            newLine += ch;
          } else {
            replace = false;
            newLine += ch;
          }
        }
        newLine = sanitizeHtml(newLine);
        dataToReturn.push({
          message: `${newLine}`,
          classStr: 'server-text',
          dateCreated: new Date(),
        });
        newUsernamesTreeLines.push(newLine);
      }

      dataToReturn.push({
        message: '-------------------------',
        classStr: 'server-text',
        dateCreated: new Date(),
      });
    }
    senderSocket.emit('messageCommandReturnStr', dataToReturn);

    // Create the ModLog
    const modUser = await User.findOne({
      usernameLower: senderSocket.request.user.username.toLowerCase(),
    });

    ModLog.create({
      type: 'miplinkedaccs',
      modWhoMade: {
        id: modUser.id,
        username: modUser.username,
        usernameLower: modUser.usernameLower,
      },
      data: {
        target: args[1],
        newUsernamesTreeLines: newUsernamesTreeLines,
        fullTree: args[2] !== undefined ? true : false,
      },
      dateCreated: new Date(),
    });
  },
};
