import { Command } from '../types';
import { SocketUser } from '../../types';
import { rooms, sendReplyToCommand } from '../../sockets';

export const pausetimer: Command = {
  command: 'pausetimer',
  help: '/pausetimer: Vote to pause timeout. Requires number_of_resistance + 1 votes.',
  run: async (args: string[], socket: SocketUser) => {
    if (!socket.request.user.inRoomId) {
      sendReplyToCommand(socket, 'You must be in a room to use /pausetimer.');
      return;
    }

    rooms[socket.request.user.inRoomId].votePauseTimeout(socket, false);
  },
};
