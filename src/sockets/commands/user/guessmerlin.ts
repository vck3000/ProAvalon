import { Command } from '../types';
import { SocketUser } from '../../types';
import { rooms, sendReplyToCommand } from '../../sockets';
import { Phase } from '../../../gameplay/phases/types';

export const guessmerlin: Command = {
  command: 'guessmerlin',
  help: '/guessmerlin <playername>: Solely for fun, submit your guess of who you think is Merlin.',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length != 2) {
      sendReplyToCommand(socket, 'Please specify a single username.');
      return;
    }

    // Check the guesser is at a table
    if (
      !socket.request.user.inRoomId ||
      !rooms[socket.request.user.inRoomId].gameStarted ||
      rooms[socket.request.user.inRoomId].phase === Phase.Finished
    ) {
      sendReplyToCommand(
        socket,
        'You must be at a running table to guess Merlin.',
      );
      return;
    }

    const msgToClient = rooms[socket.request.user.inRoomId].submitMerlinGuess(
      socket.request.user.username,
      args[1],
    );

    sendReplyToCommand(socket, msgToClient);
  },
};
