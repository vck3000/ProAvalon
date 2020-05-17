import { Injectable } from '@nestjs/common';
import { SocketUser } from '../../../users/users.socket';
import { emitCommandResponse } from '../../commandResponse';
import { Command } from '../../commands.types';

@Injectable()
export class ATestService implements Command {
  command = 'atest';

  help = '/atest: Only admins should see this command.';

  async run(senderSocket: SocketUser) {
    emitCommandResponse(
      'Running /atest. You should be an admin if you see this.',
      senderSocket,
    );
  }
}

export default ATestService;
