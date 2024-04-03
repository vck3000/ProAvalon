import { Command } from '../types';
import { SocketUser } from '../../types';
import { userCommands } from './index';

export const help: Command = {
  command: 'help',
  help: '/help: ...shows help',
  run: async (args: string[], socket: SocketUser) => {
    const dataToSend = [];

    for (const key in userCommands) {
      if (userCommands.hasOwnProperty(key)) {
        dataToSend.push({
          message: userCommands[key].help,
          classStr: 'server-text',
        });
      }
    }

    socket.emit('messageCommandReturnStr', dataToSend);
  },
};

// TODO: Check below code, there is a difference in the for loop

// help: {
//     command: 'help',
//         help: '/help: ...shows help',
//         run(data, senderSocket) {
//         // do stuff
//
//         const dataToSend = [];
//         let i = 0;
//
//         i++;
//
//         for (const key in userCommands) {
//             if (userCommands.hasOwnProperty(key)) {
//                 if (!userCommands[key].modsOnly) {
//                     dataToSend[i] = {
//                         message: userCommands[key].help,
//                         classStr: 'server-text',
//                         dateCreated: new Date(),
//                     };
//                     i++;
//                 }
//             }
//         }
//         senderSocket.emit('messageCommandReturnStr', dataToSend);
//     },
// },
