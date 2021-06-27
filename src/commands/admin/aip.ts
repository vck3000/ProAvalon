import {
  getSocketFromUsername,
  sendReplyToCommand,
} from '../../sockets/sockets';
import { SocketUser } from '../../sockets/types';

export const aip = {
  command: 'aip',
  help: '/aip <player name>: Get the ip of the player.',
  async run(data: { args: string[] }, socket: SocketUser) {
    const { args } = data;
    const username = args[1];

    if (!username) {
      sendReplyToCommand(socket, 'Specify a username');
      return;
    }

    const targetSocket = getSocketFromUsername(username);

    if (!targetSocket) {
      sendReplyToCommand(socket, 'No IP found or invalid username');
      return;
    }

    const clientIpAddress =
      targetSocket.request.headers['x-forwarded-for'] ||
      targetSocket.request.socket.remoteAddress;

    sendReplyToCommand(socket, clientIpAddress as string);
  },
};
