import { Command } from '../types';
import Settings from '../../../settings';

export const mtoggleregistration: Command = {
  command: 'mtoggleregistration',
  help: '/mtoggleregistration: Toggles site registration.',
  run: async (args, senderSocket) => {
    Settings.toggleDisableRegistration();

    const descriptor = Settings.getDisableRegistration()
      ? 'disabled'
      : 'enabled';

    senderSocket.emit('messageCommandReturnStr', {
      message: `Site registration is now ${descriptor}.`,
      classStr: 'server-text',
    });
  },
};
