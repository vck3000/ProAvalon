import { Command } from '../types';
import { modOrTOString } from '../../../modsadmins/modOrTO';
import { getIndexFromUsername, rooms } from '../../sockets';
import { Alliance } from '../../../gameplay/types';

export const mforcemove: Command = {
  command: 'mforcemove',
  help: "/mforcemove <username> [button] [target]: Forces a player to make a move. To see what moves are available, enter the target's username. To force the move, input button and/or target.",
  run: async (args, senderSocket) => {
    senderSocket.emit('messageCommandReturnStr', {
      message: `You have entered: ${args.join(' ')}`,
      classStr: 'server-text',
    });

    let username = args[1];
    const button = args[2];
    const targets = args.splice(3);

    const thisRoom = rooms[senderSocket.request.user.inRoomId];

    if (thisRoom === undefined) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Please enter a room to use this command.',
        classStr: 'server-text',
      });
      return;
    }

    if (thisRoom.gameStarted === false) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'The game has not started.',
        classStr: 'server-text',
      });
      return;
    }

    if (args.length <= 1) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Please enter valid arguments.',
        classStr: 'server-text',
      });
      return;
    }

    const playerIndex = getIndexFromUsername(
      thisRoom.playersInGame,
      username,
      true,
    );

    if (playerIndex === undefined) {
      senderSocket.emit('messageCommandReturnStr', {
        message: `Could not find player ${username}.`,
        classStr: 'server-text',
      });
      return;
    }

    // Update username to be the correct case.
    username = thisRoom.playersInGame[playerIndex].request.user.username;

    // If we have a username only:
    if (args.length === 2 || button === '') {
      const buttons = thisRoom.getClientButtonSettings(playerIndex);
      const numOfTargets = thisRoom.getClientNumOfTargets(playerIndex);
      const prohibitedIndexesToPick =
        thisRoom.getProhibitedIndexesToPick(playerIndex) || [];

      const availableButtons = [];
      if (buttons.green.hidden !== true) {
        availableButtons.push('yes');
      }
      const onMissionAndResistance =
        thisRoom.phase == 'votingMission' &&
        thisRoom.playersInGame[playerIndex].alliance === Alliance.Resistance;
      // Add a special case so resistance can't fail missions.
      if (buttons.red.hidden !== true && onMissionAndResistance === false) {
        availableButtons.push('no');
      }

      let availablePlayers = thisRoom.playersInGame
        .filter(
          (player, playerIndex) =>
            prohibitedIndexesToPick.indexOf(playerIndex) === -1,
        )
        .map((player) => player.request.user.username);

      // If there are 0 number of targets, there are no available players.
      if (numOfTargets === null) {
        availablePlayers = null; // null here so that the user can see this. For other operations, set to [].
      }

      if (availableButtons.length !== 0) {
        senderSocket.emit('messageCommandReturnStr', {
          message: '---------------',
          classStr: 'server-text',
        });
        senderSocket.emit('messageCommandReturnStr', {
          message: `Player ${username} can make the following moves:`,
          classStr: 'server-text',
        });
        senderSocket.emit('messageCommandReturnStr', {
          message: `Buttons: ${availableButtons}.`,
          classStr: 'server-text',
        });
        senderSocket.emit('messageCommandReturnStr', {
          message: `Targets: ${availablePlayers}.`,
          classStr: 'server-text',
        });
        senderSocket.emit('messageCommandReturnStr', {
          message: `Number of targets: ${numOfTargets}.`,
          classStr: 'server-text',
        });
        senderSocket.emit('messageCommandReturnStr', {
          message: '---------------',
          classStr: 'server-text',
        });
      } else {
        senderSocket.emit('messageCommandReturnStr', {
          message: `Player ${username} cannot make any moves.`,
          classStr: 'server-text',
        });
      }
    }

    // User is trying to force move.
    else {
      // Raise the caps for target usernames
      const targetsCaps = [];
      for (let i = 0; i < targets.length; i++) {
        const playerIndexFound = getIndexFromUsername(
          thisRoom.playersInGame,
          targets[i],
          true,
        );
        const playerSimulatedSocket = thisRoom.playersInGame[playerIndexFound];
        if (playerSimulatedSocket === undefined) {
          senderSocket.emit('messageCommandReturnStr', {
            message: `Could not find player ${targets[i]}.`,
            classStr: 'server-text',
          });
          return;
        }
        targetsCaps.push(
          thisRoom.playersInGame[playerIndexFound].request.user.username,
        );
      }

      const rolePrefix = modOrTOString(senderSocket.request.user.username);

      thisRoom.sendText(
        `${rolePrefix} ${senderSocket.request.user.username} has forced a move: `,
        'server-text',
      );
      thisRoom.sendText(
        `Player: ${username} | Button: ${button} | Targets: ${targetsCaps}.`,
        'server-text',
      );

      const targetSimulatedSocket = thisRoom.playersInGame[playerIndex];
      if (targetSimulatedSocket.emit === undefined) {
        targetSimulatedSocket.emit = function () {};
      }
      thisRoom.gameMove(targetSimulatedSocket, [button, targetsCaps]);
    }
  },
};
