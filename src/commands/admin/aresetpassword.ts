import { sendReplyToCommand } from '../../sockets/sockets';
import { SocketUser } from '../../sockets/types';
import User from '../../models/user';
import { Command } from '../types';

export const aresetpassword: Command = {
  command: 'aresetpassword',
  help: "/aresetpassword <username> <new_password>: set a user's password",
  run: async (args: string[], socket: SocketUser) => {

    if (args.length !== 3) {
      sendReplyToCommand(socket, 'Wrong number of inputs.');
      return;
    }

    const username = args[1];
    const new_password = args[2];

    const user = await User.findOne({
      usernameLower: username.toLowerCase(),
    });

    await new Promise<void>((res, rej) => {
      user.setPassword(new_password, (err: any) => {
        if (err) {
          rej(err);
        }
        res();
      });
    });

    await user.save();

    sendReplyToCommand(socket, 'Successfully set the new password.');
  },
};
