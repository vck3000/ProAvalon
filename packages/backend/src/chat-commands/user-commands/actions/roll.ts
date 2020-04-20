import { SocketUser } from '../../../users/users.socket';
import { emitChatResponse } from '../../chatResponse';
import { UserCommand } from '../interfaces/user-commands.interface';

class Roll implements UserCommand {
  command: string;

  help: string;

  constructor(command: string) {
    this.command = command;
    this.help =
      '/roll <optional number>: returns a random number between 1 and 10 or 1 and positive integer.';
  }

  run(data: string[], senderSocket: SocketUser) {
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
  }
}

export default Roll;
