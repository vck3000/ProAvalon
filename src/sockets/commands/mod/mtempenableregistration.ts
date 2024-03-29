import { Command } from '../types';
import Settings from '../../../settings';

export const mtempenableregistration: Command = {
  command: 'mtempenableregistration',
  help: '/mtempenableregistration: Temporarily enables site registration for 5 minutes.',
  run: async (args, senderSocket) => {
    const registrationStatus = Settings.getDisableRegistration();

    if (registrationStatus) {
      senderSocket.emit('messageCommandReturnStr', {
        message: `Site registration was already enabled.`,
        classStr: 'server-text',
      });

      return;
    }

    // Enable registration
    Settings.toggleDisableRegistration();

    senderSocket.emit('messageCommandReturnStr', {
      message: `Site registration was temporarily enabled for 5 minutes.`,
      classStr: 'server-text',
    });

    // Now disable registration after delay
    setTimeout(async () => {
      // Re-pull status in case it was already disabled separately.
      const registrationStatus = Settings.getDisableRegistration();

      if (registrationStatus) {
        Settings.toggleDisableRegistration();
      }
    }, 1000 * 60 * 5 /* 5 minutes */);
  },
};
