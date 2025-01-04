import { sendReplyToCommand } from '../../sockets';
import { SocketUser } from '../../types';
import { Command } from '../types';
import { sendToDiscordAdmins, sendToDiscordMods } from '../../../clients/discord';

export const adiscordmessage: Command = {
  command: 'adiscordmessage',
  help: '/adiscordmessage <admin|mod> <ping (true|false)> <message>: Sends a discord message to the admin or mod channel.',
  run: async (args: string[], socket: SocketUser) => {

    if (args.length < 4) {
      sendReplyToCommand(socket, 'Need at least 3 args.');
      return;
    }

    const channel = args[1];
    const ping = args[2] === "true";
    const message = args.slice(3).join(' ');

    switch(channel)
    {
      case "admin": {
        sendToDiscordAdmins(message, ping);
        break;
      }
      case "mod": {
        sendToDiscordMods(message, ping);
        break;
      }
      default: {
        sendToDiscordAdmins(`Invalid channel. Expected "admin" or "mod", got ${channel}.`);
        return;
      }
    }

    sendReplyToCommand(socket, 'Message sent.');
  },
};
