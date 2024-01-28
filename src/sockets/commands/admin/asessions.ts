import { sendReplyToCommand } from '../../sockets';
import { SocketUser } from '../../types';
import { Command } from '../types';
import { MongoClient } from 'mongodb';

export const asessions: Command = {
  command: 'asessions',
  help: '/asessions <username>: Get the sessions of a player.',
  run: async (args: string[], socket: SocketUser) => {
    const username = args[1];

    if (!username) {
      sendReplyToCommand(socket, 'Specify a username');
      return;
    }

    const dbResult = await MongoClient.connect(process.env.DATABASEURL);

    const mySessions = dbResult.db().collection('mySessions');
    const entries = mySessions.find({ 'session.usernameLower': username });

    for await (const entry of entries) {
      console.log(entry);
    }
  },
};
