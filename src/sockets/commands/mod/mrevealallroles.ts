import { Command } from '../types';
import { modOrTOString } from '../../../modsadmins/modOrTO';
import { rooms } from '../../sockets';

export const mrevealallroles: Command = {
  command: 'mrevealallroles',
  help: '/mrevealallroles : Reveals the roles of all players in the current room.',
  run: async (args, senderSocket) => {
    const roomId = senderSocket.request.user.inRoomId;

    if (!rooms[roomId]) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'You are not in a room.',
        classStr: 'server-text',
      });
      return;
    }

    if (!rooms[roomId].gameStarted) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Game has not started.',
        classStr: 'server-text',
      });
      return;
    }

    const rolePrefix = modOrTOString(senderSocket.request.user.username);

    rooms[roomId].sendText(
      rooms[roomId].allSockets,
      `${rolePrefix} ${senderSocket.request.user.username} has learned all roles.`,
      'server-text',
    );

    // reveal role for each user
    rooms[roomId].playersInGame.forEach((user) => {
      senderSocket.emit('messageCommandReturnStr', {
        message: `${user.username}'s role is ${user.role.toUpperCase()}.`,
        classStr: 'server-text',
      });
    });

    return;
  },
};
