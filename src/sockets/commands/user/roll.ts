import { Command } from '../types';
import { SocketUser } from '../../types';
import { sendReplyToCommand } from '../../sockets';

export const roll: Command = {
  command: 'roll',
  help: '/roll <optional number>: Returns a random number between 1 and 10 or 1 and optional number.',
  run: async (args: string[], socket: SocketUser) => {
    console.log(args.length);
    if (args.length > 2) {
      sendReplyToCommand(socket, 'Enter just one number.');
      return;
    }
    if (args[1]) {
      const optionalNumber = parseInt(args[1]);

      if (isNaN(optionalNumber) || optionalNumber.toString() !== args[1]) {
        sendReplyToCommand(socket, 'That is not a valid number!');
        return;
      } else {
        sendReplyToCommand(
          socket,
          (Math.floor(Math.random() * parseInt(args[1])) + 1).toString(),
        );
        return;
      }
    }

    sendReplyToCommand(socket, (Math.floor(Math.random() * 10) + 1).toString());
  },
};
