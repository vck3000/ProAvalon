import { Command } from '../types';
import { SocketUser } from '../../types';
import {
  allSockets,
  getIndexFromUsername,
  sendReplyToCommand,
  userCommands,
} from '../../sockets';
import { isMod } from '../../../modsadmins/mods';
import ModLog from '../../../models/modLog';

const pmmodCooldowns: { [key: string]: Date } = {};
const PMMOD_TIMEOUT = 3000; // 3 seconds

export const pmmod: Command = {
  command: 'pmmod',
  help: '/pmmod <mod_username> <message>: Sends a private message to an online moderator.',
  run: async (args: string[], socket: SocketUser) => {
    // Check if they are spamming, i.e. have sent a PM before the timeout is up
    const lastPmTime = pmmodCooldowns[socket.id];
    if (lastPmTime) {
      const timeSinceLastPm = new Date().getTime() - lastPmTime.getTime();

      if (timeSinceLastPm < PMMOD_TIMEOUT) {
        sendReplyToCommand(
          socket,
          `Please wait ${Math.ceil(
            (PMMOD_TIMEOUT - timeSinceLastPm) / 1000,
          )} seconds before sending another pm!`,
        );
        return;
      } else {
        delete pmmodCooldowns[socket.id];
      }
    }

    // Validate command inputs
    if (args.length < 3) {
      sendReplyToCommand(socket, 'Please specify <mod_username> <message>.');
      return;
    }

    const usernameLower = socket.request.user.usernameLower;
    const modUsernameLower = args[1].toLowerCase();

    if (modUsernameLower === usernameLower) {
      sendReplyToCommand(socket, 'You cannot private message yourself!');
      return;
    }
    if (!isMod(modUsernameLower)) {
      sendReplyToCommand(
        socket,
        `${modUsernameLower} is not a mod. You may not private message them.`,
      );
      return;
    }

    const modSocket =
      allSockets[getIndexFromUsername(allSockets, args[1], true)];

    if (!modSocket) {
      sendReplyToCommand(
        socket,
        `${args[1]} is offline. Please type /mods for a list of online mods.`,
      );
      return;
    }

    // Create and send message to mod
    const str = `${usernameLower}->${modUsernameLower} (pmmod): ${args
      .slice(2)
      .join(' ')}`;

    const dataMessage = {
      message: str,
      dateCreated: new Date(),
      classStr: 'whisper',
    };

    socket.emit('allChatToClient', dataMessage);
    socket.emit('roomChatToClient', dataMessage);

    modSocket.emit('allChatToClient', dataMessage);
    modSocket.emit('roomChatToClient', dataMessage);

    // Send out a buzz to mods
    userCommands.interactUser.run(['/buzz', 'buzz', modUsernameLower], socket);

    // Set a cooldown for the sender until they can send another pm
    pmmodCooldowns[socket.id] = new Date();

    // Create the mod log.
    const mlog = ModLog.create({
      type: 'pmmod',
      modWhoMade: {
        id: modSocket.request.user.id,
        username: modSocket.request.user.username,
        usernameLower: modSocket.request.user.usernameLower,
      },
      data: {
        targetUser: {
          id: socket.request.user.id,
          username: socket.request.user.username,
          usernameLower: socket.request.user.usernameLower,
        },
        message: dataMessage.message,
      },
      dateCreated: new Date(),
    });
  },
};
