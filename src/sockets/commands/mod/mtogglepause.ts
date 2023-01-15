import { Command } from '../types';
import { rooms } from '../../sockets';

export const mtogglepause: Command = {
  command: 'mtogglepause',
  help: '/mtogglepause: Pauses or unpauses the current room.',
  run: async (args, senderSocket) => {
    const currentRoom = rooms[senderSocket.request.user.inRoomId];

    if (!currentRoom) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'You are not in a room.',
        classStr: 'server-text',
      });
      return;
    }

    if (!currentRoom.gameStarted) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Game has not started.',
        classStr: 'server-text',
      });
      return;
    }

    if (currentRoom.phase == 'finished') {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Game has finished.',
        classStr: 'server-text',
      });
      return;
    }

    currentRoom.togglePause(senderSocket.request.user.username);
  },
};
