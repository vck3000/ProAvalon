import { Command } from '../types';
import { destroyRoom, rooms, updateCurrentGamesList } from '../../sockets';

export const mclose: Command = {
  command: 'mclose',
  help: '/mclose <roomId> [<roomId> <roomId> ...]: Close room <roomId>. Also removes the corresponding save files in the database. Can take multiple room IDs.',
  run: async (args, senderSocket) => {
    if (!args[1]) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Specify a number.',
        classStr: 'server-text',
      });
      return;
    }

    const roomIdsToClose = args.splice(1);

    roomIdsToClose.forEach((idToClose) => {
      const idToCloseNum = parseInt(idToClose);

      if (rooms[idToCloseNum] !== undefined) {
        // Disconnect everyone
        for (let i = 0; i < rooms[idToCloseNum].allSockets.length; i++) {
          rooms[idToCloseNum].allSockets[i].emit('leave-room-requested');
        }

        // Stop bots thread if they are playing:
        if (rooms[idToCloseNum].interval) {
          clearInterval(rooms[idToCloseNum].interval);
          rooms[idToCloseNum].interval = undefined;
        }

        // Forcefully close room
        if (rooms[idToCloseNum]) {
          destroyRoom(rooms[idToCloseNum].roomId);
        }
        senderSocket.emit('messageCommandReturnStr', {
          message: `Closed room ${idToCloseNum}.`,
          classStr: 'server-text',
        });
      } else {
        senderSocket.emit('messageCommandReturnStr', {
          message: `Could not close room ${idToCloseNum}.`,
          classStr: 'server-text',
        });
      }
    });

    updateCurrentGamesList();
  },
};
