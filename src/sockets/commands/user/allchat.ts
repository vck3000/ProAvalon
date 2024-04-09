import { Command } from '../types';
import { SocketUser } from '../../types';
import { GetLastFiveMinsAllChat, sendReplyToCommand } from '../../sockets';

export const allchat: Command = {
  command: 'allchat',
  help: '/allchat: Get a copy of the last 5 minutes of allchat.',
  run: async (args: string[], socket: SocketUser) => {
    // @ts-ignore
    socket.emit('messageCommandReturnStr', GetLastFiveMinsAllChat());
  },
};
