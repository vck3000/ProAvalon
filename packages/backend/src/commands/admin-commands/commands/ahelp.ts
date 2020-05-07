import { SocketUser } from '../../../users/users.socket';
import { emitCommandResponse } from '../../commandResponse';
import RedisAdapter from '../../../redis-adapter/redis-adapter.service';
import { Command } from '../../commands.types';
import adminActions from '../admin-commands';

export const AHelp: Command = {
  command: 'a',

  help: '/a: shows the available commands and usage.',

  run: (
    _data: string[],
    senderSocket: SocketUser,
    _redisAdapter: RedisAdapter,
  ) => {
    emitCommandResponse('Admin commands are:', senderSocket);
    Object.keys({ ...adminActions }).forEach((key) => {
      emitCommandResponse(adminActions[key].help, senderSocket);
    });
  },
};

export default AHelp;
