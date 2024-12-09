import { Command } from '../types';
import { settingsSingleton } from '../../../settings';

export const mtoggleregistration: Command = {
  command: 'mtoggleregistration',
  help: '/mtoggleregistration: Toggles site registration.',
  run: async (args, senderSocket) => {
    settingsSingleton.toggleDisableRegistration();

    const descriptor = settingsSingleton.getDisableRegistration()
      ? 'disabled'
      : 'enabled';

    senderSocket.emit('messageCommandReturnStr', {
      message: `Site registration is now ${descriptor}.`,
      classStr: 'server-text',
    });
  },
};
