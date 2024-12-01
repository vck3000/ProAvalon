import { sendReplyToCommand } from '../../sockets';
import { SocketUser } from '../../types';
import User from '../../../models/user';
import { Command } from '../types';
import crypto from 'crypto';

// Returns the password generated
async function resetAccount(username: string) : Promise<string>
{
  await User.deleteOne({ usernameLower: username.toLowerCase() });

  const password = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const newUser = new User({
    username: username,
    usernameLower: username.toLowerCase(),
    dateJoined: new Date(),
    emailAddress: `${username}@gmail.com`,
    emailVerified: true,
  });

  // @ts-ignore
  await User.register(newUser, password);

  return password;
}

export const aresettournamentaccounts: Command = {
  command: 'aresettournamentaccounts',
  help: '/aresettournamentaccounts: Deletes and recreates tournament accounts: coach1, coach2, ..., coach10.',
  run: async (args: string[], socket: SocketUser) => {
    const deletedMsgs = [];
    const createdMsgs = [];

    for (let i = 1; i <= 10; i++) {
      const username = `anon${i}`;
      const password = await resetAccount(username);

      deletedMsgs.push(`Deleted ${username}.`);
      createdMsgs.push(`Created ${username} with password ${password}.`);
      console.log(`Deleted ${username} and recreated with password ${password}.`);
    }

    for (let i = 1; i <= 10; i++) {
      const username = `coach${i}`;
      const password = await resetAccount(username);

      deletedMsgs.push(`Deleted ${username}.`);
      createdMsgs.push(`Created ${username} with password ${password}.`);
      console.log(`Deleted ${username} and recreated with password ${password}.`);
    }

    for (const msg of deletedMsgs) {
      sendReplyToCommand(socket, msg);
    }

    for (const msg of createdMsgs) {
      sendReplyToCommand(socket, msg);
    }
  },
};
