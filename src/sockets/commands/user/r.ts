import { Command } from '../types';
import { SocketUser } from '../../types';
import {
  allSockets,
  getIndexFromUsername,
  sendReplyToCommand,
} from '../../sockets';
import { lastWhisperObj } from '../mod/mwhisper';

export const r: Command = {
  command: 'r',
  help: '/r: Reply to a mod who just messaged you.',
  run: async (args: string[], socket: SocketUser) => {
    const usernameLower = socket.request.user.usernameLower;

    if (!lastWhisperObj[usernameLower]) {
      sendReplyToCommand(socket, `You haven't been whispered to before.`);
      return;
    }

    const targetModUsernameLower =
      lastWhisperObj[usernameLower].username.toLowerCase();
    const targetModSocket =
      allSockets[
        getIndexFromUsername(allSockets, targetModUsernameLower, true)
      ];

    if (!targetModSocket) {
      sendReplyToCommand(socket, `${targetModUsernameLower} has disconnected.`);
      return;
    }

    // Create and send message to mod
    const str = `${usernameLower}->${targetModUsernameLower} (whisper): ${args
      .slice(1)
      .join(' ')}`;

    const dataMessage = {
      message: str,
      dateCreated: new Date(),
      classStr: 'whisper',
    };

    socket.emit('allChatToClient', dataMessage);
    socket.emit('roomChatToClient', dataMessage);

    targetModSocket.emit('allChatToClient', dataMessage);
    targetModSocket.emit('roomChatToClient', dataMessage);

    const modlog = lastWhisperObj[usernameLower].modlog;
    modlog.data.log.push(dataMessage);
    modlog.markModified('data');
    modlog.save();
  },
};
