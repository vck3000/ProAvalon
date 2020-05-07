import { SocketUser } from '../../../users/users.socket';
import { emitCommandResponse } from '../../commandResponse';
import { Command } from '../../commands.types';

export const Roll: Command = {
  command: 'roll',
  help:
    '/roll [number]: Returns a random number between 1 and (10 or specified number).',
  run: (data: string[], senderSocket: SocketUser) => {
    const num = Number(data[0]);

    if (Number.isNaN(num)) {
      emitCommandResponse(
        `The RNG gods do not understand your request: ${data[0]}.`,
        senderSocket,
      );
    } else if (num <= 0) {
      emitCommandResponse(
        `The RNG gods are not pleased with your request: ${data[0]}.`,
        senderSocket,
      );
    } else {
      const rolled = Math.floor(Math.random() * num) + 1;
      emitCommandResponse(
        `The RNG gods have graced you with: ${rolled}`,
        senderSocket,
      );
    }
  },
};

export default Roll;
