import { SocketUser } from '../../../../users/users.socket';
import { emitChatResponse } from '../../chatResponse';
import { Command } from '../../commands.types';

export class UserInteraction implements Command {
  command: string;

  pastTenseCommand: string;

  help: string;

  constructor(command: string, pastTenseCommand: string) {
    this.command = command;
    this.pastTenseCommand = pastTenseCommand;
    this.help = `/${command} <playername>: ${command} a player.`;
  }

  run(data: string[], senderSocket: SocketUser) {
    emitChatResponse(
      `${senderSocket.user.displayUsername} has ${this.pastTenseCommand} you!`,
      // change later
      senderSocket,
    );
    emitChatResponse(
      `You have ${this.pastTenseCommand} ${data[0]}!`,
      senderSocket,
    );
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
