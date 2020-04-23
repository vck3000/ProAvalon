import { SocketUser } from '../../../../users/users.socket';
import { emitCommandResponse } from '../../commandResponse';
import RedisAdapter from '../../../../redis-adapter/redis-adapter.service';
import { Command } from '../../commands.types';
import userCommands from '../user-commands';

export const Help: Command = {
  command: 'help',

  help: '/help: shows the available commands and usage.',

  run: (
    _data: string[],
    senderSocket: SocketUser,
    _redisAdapter: RedisAdapter,
  ) => {
    emitCommandResponse('User commands are:', senderSocket);
    Object.keys({ ...userCommands }).forEach((key) => {
      emitCommandResponse(userCommands[key].help, senderSocket);
    });
  },
};

export default Help;
