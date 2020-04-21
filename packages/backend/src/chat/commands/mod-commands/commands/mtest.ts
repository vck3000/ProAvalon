import { SocketUser } from '../../../../users/users.socket';
import { emitChatResponse } from '../../chatResponse';
import { Command } from '../../commands.types';

export const MTest: Command = {
  command: 'mtest',
  help: '/mtest: Only moderators should see this command.',
  run: (_data: string[], senderSocket: SocketUser) => {
    // Check user is a moderator

    emitChatResponse(
      'Running /mtest. You should be a moderator if you see this.',
      senderSocket,
    );
  },
};

export default MTest;
