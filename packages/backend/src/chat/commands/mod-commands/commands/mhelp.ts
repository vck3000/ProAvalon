import { SocketUser } from '../../../../users/users.socket';
import { emitCommandResponse } from '../../commandResponse';
import RedisAdapter from '../../../../redis-adapter/redis-adapter.service';
import { Command } from '../../commands.types';
import modActions from '../mod-commands';

export const MHelp: Command = {
  command: 'm',

  help: '/m: shows the available commands and usage.',

  run: (
    _data: string[],
    senderSocket: SocketUser,
    _redisAdapter: RedisAdapter,
  ) => {
    emitCommandResponse('Mod commands are:', senderSocket);
    Object.keys({ ...modActions }).forEach((key) => {
      emitCommandResponse(modActions[key].help, senderSocket);
    });
  },
};

export default MHelp;
