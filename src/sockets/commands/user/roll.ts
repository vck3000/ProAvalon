import { Command } from '../types';
import { SocketUser } from '../../types';
import { sendReplyToCommand } from '../../sockets';

export const roll: Command = {
  command: 'roll',
  help: '/roll <optional number>: Returns a random number between 1 and 10 or 1 and optional number.',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length > 2) {
      sendReplyToCommand(socket, 'Enter just one number.');
      return;
    }

    // Default value
    let maxNum = 10;

    // They didn't give a value in
    if (args.length === 2) {
      const optionalNumber = parseInt(args[1]);

      if (isNaN(optionalNumber) || optionalNumber.toString() !== args[1]) {
        sendReplyToCommand(socket, 'That is not a valid number!');
        return;
      }

      maxNum = optionalNumber;
    }

    sendReplyToCommand(
      socket,
      (Math.floor(Math.random() * maxNum) + 1).toString(),
    );
  },
};
