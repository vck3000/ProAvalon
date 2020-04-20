import { ChatResponse } from '../../../proto/lobbyProto';
import { generateChatResponse } from './user-commands.service';

export class UserInteraction {
  verb: string;

  pastTenseVerb: string;

  help: string;

  constructor(verb: string, pastTenseVerb: string) {
    this.verb = verb;
    this.pastTenseVerb = pastTenseVerb;
    this.help = `/${verb} <playername>: ${verb} a player.`;
  }

  run(sender: string, subject: string): ChatResponse[] {
    return [
      generateChatResponse(`${sender} has ${this.pastTenseVerb} you!`, subject),
      generateChatResponse(
        `You have ${this.pastTenseVerb} ${subject}!`,
        sender,
      ),
    ];
  }
}
