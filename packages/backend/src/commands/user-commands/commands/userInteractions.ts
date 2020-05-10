import { SocketUser } from '../../../users/users.socket';
import { emitCommandResponse } from '../../commandResponse';
import { Command } from '../../commands.types';
import RedisAdapterService from '../../../redis-adapter/redis-adapter.service';
import { ChatResponseType } from '../../../../proto/lobbyProto';

class UserInteraction implements Command {
  command: string;

  pastTenseCommand: string;

  help: string;

  constructor(command: string, pastTenseCommand: string) {
    this.command = command;
    this.pastTenseCommand = pastTenseCommand;
    this.help = `/${command} <playername>: ${command} a player.`;
  }

  async run(
    data: string[],
    senderSocket: SocketUser,
    redisAdapter: RedisAdapterService,
  ) {
    const ret = await redisAdapter.emitToUsername(
      data[0],
      `${senderSocket.user.displayUsername} has ${this.pastTenseCommand} you!`,
      ChatResponseType.USER_COMMAND,
    );

    if (ret) {
      emitCommandResponse(
        `You have ${this.pastTenseCommand} ${data[0]}!`,
        senderSocket,
      );
    } else {
      emitCommandResponse(
        `Something went wrong trying to ${this.command} ${data[0]}.`,
        senderSocket,
      );
    }
  }
}

export const userInteractions: Record<string, any> = {
  buzz: new UserInteraction('buzz', 'buzzed'),
  lick: new UserInteraction('lick', 'licked'),
  slap: new UserInteraction('slap', 'slapped'),
  punch: new UserInteraction('punch', 'punched'),
  boop: new UserInteraction('boop', 'booped'),
  tickle: new UserInteraction('tickle', 'tickled'),
};
