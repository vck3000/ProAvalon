import { SocketUser } from '../../../../users/users.socket';
import { emitCommandResponse } from '../../commandResponse';
import { Command } from '../../commands.types';

export const ATest: Command = {
  command: 'atest',
  help: '/atest: Only admins should see this command.',
  run: (_data: string[], senderSocket: SocketUser) => {
    // Check user is an admin

    emitCommandResponse(
      'Running /atest. You should be an admin if you see this.',
      senderSocket,
    );
  },
};

export default ATest;
