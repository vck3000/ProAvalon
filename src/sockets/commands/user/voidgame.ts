import { Command } from '../types';
import { SocketUser } from '../../types';
import { rooms, sendReplyToCommand } from '../../sockets';

export const voidgame: Command = {
  command: 'voidgame',
  help: '/voidgame: Vote to void a game. Requires number_of_resistance + 1 votes. You cannot take back your void game vote.',
  run: async (args: string[], socket: SocketUser) => {
    if (!socket.request.user.inRoomId) {
      sendReplyToCommand(socket, 'You must be in a room to use /voidgame.');
      return;
    }

    rooms[socket.request.user.inRoomId].voteVoidGame(socket);
  },
};
