import { SocketUser } from '../../../../users/users.socket';
import { emitChatResponse } from '../../chatResponse';
import { Command } from '../../commands.types';

export const Roll: Command = {
  command: 'roll',
  help:
    '/roll [number]: Returns a random number between 1 and (10 or specified number).',
  run: (data: string[], senderSocket: SocketUser) => {
    let num = Number(data[0]);
    if (!num && num !== 0) {
      num = 10;
    }
    if (num > 0 && Number.isInteger(num)) {
      emitChatResponse(
        (Math.floor(Math.random() * num) + 1).toString(),
        senderSocket,
      );
    } else {
      emitChatResponse(`${num} is not a valid positive integer.`, senderSocket);
    }
  },
};

export default Roll;
