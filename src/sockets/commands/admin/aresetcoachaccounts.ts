import { sendReplyToCommand } from '../../sockets';
import { SocketUser } from '../../types';
import User from '../../../models/user';
import { Command } from '../types';
import crypto from 'crypto';

export const aresetcoachaccounts: Command = {
  command: 'aresetcoachaccounts',
  help: '/aresetcoachaccounts: Deletes and recreates coach accounts: coach1, coach2, ..., coach10. Passwords are the username.',
  run: async (args: string[], socket: SocketUser) => {
    const deletedMsgs = [];
    const createdMsgs = [];

    for (let i = 1; i <= 10; i++) {
      const username = `coach${i}`;
      const password = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

      await User.deleteOne({ usernameLower: username.toLowerCase() });
      deletedMsgs.push(`Deleted ${username}.`);

      const newUser = new User({
        username: username,
        usernameLower: username.toLowerCase(),
        dateJoined: new Date(),
        emailAddress: `${i}@gmail.com`,
        emailVerified: true,
      });

      // @ts-ignore
      await User.register(newUser, password);

      createdMsgs.push(`Created ${username} with password ${password}.`);
    }

    for (const msg of deletedMsgs) {
      sendReplyToCommand(socket, msg);
    }

    for (const msg of createdMsgs) {
      sendReplyToCommand(socket, msg);
    }
  },
};
