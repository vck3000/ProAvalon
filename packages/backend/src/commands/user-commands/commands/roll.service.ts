import { Injectable } from '@nestjs/common';
import { SocketUser } from '../../../users/users.socket';
import { emitCommandResponse } from '../../commandResponse';
import { Command } from '../../commands.types';

@Injectable()
export class RollService implements Command {
  command = 'roll';
  help =
    '/roll [number]: Returns a random number between 1 and 10 or specified number).';

  async run(socket: SocketUser, data: string[]) {
    let num = Number(data[0]);

    // If the user gave something and it's not a number
    if (Number.isNaN(num) && data[0]) {
      emitCommandResponse(
        `The RNG gods do not understand your request: ${data[0]}.`,
        socket,
      );
    } else if (num <= 0) {
      emitCommandResponse(
        `The RNG gods are not pleased with your request: ${data[0]}.`,
        socket,
      );
    } else {
      if (!data[0]) {
        num = 10; // Default if no number was given
      }
      const rolled = Math.floor(Math.random() * num) + 1;
      emitCommandResponse(
        `The RNG gods have graced you with: ${rolled}`,
        socket,
      );
    }
  }
}

export default RollService;
