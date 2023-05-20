import { Command } from '../types';
import gameRoom from '../../../gameplay/gameWrapper';
import { SocketUser } from '../../types';
import { SimpleBotSocket } from '../../bot';
import {
  incrementNextRoomId,
  ioGlobal,
  nextRoomId,
  rooms,
  sendToAllChat,
  socketCallback,
} from '../../sockets';
import { roomCreationTypeEnum } from '../../../gameplay/roomTypes';

function addBots(args: string[], senderSocket: SocketUser, roomId: number) {
  if (!args[1]) {
    senderSocket.emit('messageCommandReturnStr', {
      message: 'Specify a number.',
      classStr: 'server-text',
    });
    return;
  }

  const numBots = parseInt(args[1]);

  if (rooms[roomId]) {
    const dummySockets = [];

    for (let i = 0; i < numBots; i++) {
      const botName = `${'SimpleBot' + '#'}${Math.floor(Math.random() * 100)}`;

      // Avoid a username clash!
      const currentUsernames = rooms[roomId].socketsOfPlayers.map(
        (sock) => sock.request.user.username,
      );
      if (currentUsernames.includes(botName)) {
        i--;
        continue;
      }

      dummySockets[i] = new SimpleBotSocket(botName);
      rooms[roomId].playerJoinRoom(dummySockets[i], '');
      rooms[roomId].playerSitDown(dummySockets[i]);

      rooms[roomId].botSockets.push(dummySockets[i]);
    }
  }
}

export const atestgame: Command = {
  command: 'atestgame',
  help: '/atestgame <number>: Add <number> bots to a test game and start it automatically.',
  run: async (args: string[], socket: SocketUser) => {
    if (!args[1]) {
      socket.emit('messageCommandReturnStr', {
        message: 'Specify a number.',
        classStr: 'server-text',
      });
      return;
    }

    if (parseInt(args[1]) > 10 || parseInt(args[1]) < 1) {
      socket.emit('messageCommandReturnStr', {
        message: 'Specify a number between 1 and 10.',
        classStr: 'server-text',
      });
      return;
    }

    // Get the next roomId
    while (rooms[nextRoomId]) {
      incrementNextRoomId();
    }

    const dataObj = {
      maxNumPlayers: 10,
      newRoomPassword: '',
      gameMode: 'avalonBot',
      muteSpectators: false,
    };

    // Create the room
    rooms[nextRoomId] = new gameRoom(
      'Bot game',
      nextRoomId,
      ioGlobal,
      dataObj.maxNumPlayers,
      dataObj.newRoomPassword,
      dataObj.gameMode,
      dataObj.muteSpectators,
      false,
      roomCreationTypeEnum.CUSTOM_ROOM,
      socketCallback,
    );
    const privateStr = dataObj.newRoomPassword === '' ? '' : 'private ';
    // broadcast to all chat
    const messageData = {
      message: `${
        'Bot game' + ' has created '
      }${privateStr}room ${nextRoomId}.`,
      classStr: 'server-text',
    };
    sendToAllChat(ioGlobal, messageData);

    // Add the bots to the room
    addBots(args, socket, nextRoomId);

    // Start the game.
    const options = [
      'Merlin',
      'Assassin',
      'Percival',
      'Morgana',
      'Ref of the Rain',
      'Sire of the Sea',
      'Lady of the Lake',
    ];
    rooms[nextRoomId].hostTryStartGame(options, 'avalonBot');
  },
};
