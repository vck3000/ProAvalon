import { sendReplyToCommand } from '../../sockets';
import { SocketUser } from '../../types';
import User from '../../../models/user';
import { Command } from '../types';

export const acreatetestaccounts: Command = {
  command: 'acreatetestaccounts',
  help: '/acreatetestaccounts: Creates test accounts: 1 to 10. Passwords are the username.',
  run: async (args: string[], socket: SocketUser) => {
    if (process.env.ENV === 'prod') {
      sendReplyToCommand(socket, 'Cannot create test accounts in prod.');
      return;
    }

    for (let i = 1; i <= 10; i++) {
      await User.deleteOne({ usernameLower: i.toString() });

      const newUser = new User({
        username: i.toString(),
        usernameLower: i.toString(),
        dateJoined: new Date(),
        emailAddress: `${i}@gmail.com`,
      });

      // @ts-ignore
      await User.register(newUser, i.toString() /* password */, (err, user) => {
        user.emailVerified = true;
        user.markModified('emailVerified');
        user.save();
      });
    }

    sendReplyToCommand(socket, 'Created test accounts.');
  },
};
