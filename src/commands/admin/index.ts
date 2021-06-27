import { aip } from './aip';
import { aresetpassword } from './aresetpassword';

export const adminCommands = {
  a: {
    command: 'a',
    help: '/a: ...shows mods commands',
    run(): any {
      const dataToReturn = [];

      for (const key in adminCommands) {
        if (adminCommands.hasOwnProperty(key)) {
          dataToReturn.push({
            message: adminCommands[key].help,
            classStr: 'server-text',
          });
        }
      }

      return dataToReturn;
    },
  },

  [aip.command]: aip,
  [aresetpassword.command]: aresetpassword,
};
