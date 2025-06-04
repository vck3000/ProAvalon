import { sendReplyToCommand, ToggleCreateNewRoomAllowed } from '../../sockets';
import { SocketUser } from '../../types';
import { Command } from '../types';

export const atogglecreateroom: Command = {
  command: 'atogglecreateroom',
  help: '/atogglecreateroom: Toggles allowing the creation of new rooms.',
  run: async (args: string[], socket: SocketUser) => {
    ToggleCreateNewRoomAllowed();
    sendReplyToCommand(socket, "Toggled allowing of create new room.");
  },
};
