import { Command } from '../types';
import ModLog from '../../../models/modLog';
import { allSockets, getIndexFromUsername } from '../../sockets';

interface TargetLastWhisper {
  username: string;
  modlog: any; // ModLog document
}

export const lastWhisperObj: Record<string, TargetLastWhisper> = {};

export const mwhisper: Command = {
  command: 'mwhisper',
  help: '/mwhisper <player name> <text to send>: Sends a whisper to a player.',
  async run(args, senderSocket) {
    if (args.length === 1) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Missing username to message.',
        classStr: 'server-text',
      });
      return;
    }

    if (
      args[1].toLowerCase() ===
      senderSocket.request.user.username.toLowerCase()
    ) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'You cannot whisper yourself...',
        classStr: 'server-text',
      });
    }

    const sendToSocket =
      allSockets[getIndexFromUsername(allSockets, args[1], true)];

    if (!sendToSocket) {
      senderSocket.emit('messageCommandReturnStr', {
        message: `Could not find ${args[1]}.`,
        classStr: 'server-text',
      });
    } else {
      let str = `${senderSocket.request.user.username}->${sendToSocket.request.user.username} (whisper): `;
      for (let i = 2; i < args.length; i++) {
        str += args[i];
        str += ' ';
      }

      const dataMessage = {
        message: str,
        dateCreated: new Date(),
        classStr: 'whisper',
      };

      // send notification that you can do /r for first whisper message
      if (!lastWhisperObj[sendToSocket.request.user.username.toLowerCase()]) {
        sendToSocket.emit('allChatToClient', {
          message: 'You can do /r <message> to reply.',
          classStr: 'whisper',
          dateCreated: new Date(),
        });
        sendToSocket.emit('roomChatToClient', {
          message: 'You can do /r <message> to reply.',
          classStr: 'whisper',
          dateCreated: new Date(),
        });
      }

      sendToSocket.emit('allChatToClient', dataMessage);
      sendToSocket.emit('roomChatToClient', dataMessage);

      senderSocket.emit('allChatToClient', dataMessage);
      senderSocket.emit('roomChatToClient', dataMessage);

      const mlog = await ModLog.create({
        type: 'mwhisper',
        modWhoMade: {
          id: senderSocket.request.user.id,
          username: senderSocket.request.user.username,
          usernameLower: senderSocket.request.user.usernameLower,
        },
        data: {
          targetUser: {
            id: sendToSocket.request.user.id,
            username: sendToSocket.request.user.username,
            usernameLower: sendToSocket.request.user.usernameLower,
          },
          log: [dataMessage],
        },
        dateCreated: new Date(),
      });

      // set the last whisper person
      lastWhisperObj[sendToSocket.request.user.username.toLowerCase()] = {
        username: senderSocket.request.user.username.toLowerCase(),
        modlog: mlog,
      };

      lastWhisperObj[senderSocket.request.user.username.toLowerCase()] = {
        username: sendToSocket.request.user.username.toLowerCase(),
        modlog: mlog,
      };
    }
  },
};