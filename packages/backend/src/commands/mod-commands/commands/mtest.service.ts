import { Injectable } from '@nestjs/common';
import { SocketUser } from '../../../users/users.socket';
import { emitCommandResponse } from '../../commandResponse';
import { Command } from '../../commands.types';

@Injectable()
export class MTestService implements Command {
  command = 'mtest';

  help = '/mtest: Only moderators should see this command.';

  async run(socket: SocketUser) {
    emitCommandResponse(
      'Running /mtest. You should be a moderator if you see this.',
      socket,
    );
  }
}
