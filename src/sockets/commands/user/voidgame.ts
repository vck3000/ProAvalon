import { Command } from '../types';
import { SocketUser } from '../../types';
import { rooms, sendReplyToCommand } from '../../sockets';

export const voidgame: Command = {
  command: 'voidgame',
  help: '/voidgame: Vote to unpause timeout. Requires 1 vote.',
  run: async (args: string[], socket: SocketUser) => {
    if (!socket.request.user.inRoomId) {
      sendReplyToCommand(socket, 'You must be in a room to use /voidgame.');
      return;
    }

    rooms[socket.request.user.inRoomId].voteVoidGame(socket);
  },
};
