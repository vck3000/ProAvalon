import { ChatResponse } from '../../../proto/lobbyProto';
import { UserInteraction } from './user-interaction.dto';
import { generateChatResponse } from './user-commands.service';

export interface UserAction {
  command: string;
  help: string;
  run: (sender: string, subject?: string) => ChatResponse[];
}

interface UserActions {
  // Allow string to be used as index
  [key: string]: any;
  help: UserAction;
  roll: UserAction;
}

export const userInteractions: Record<string, any> = {
  buzz: new UserInteraction('buzz', 'buzzed'),
  lick: new UserInteraction('lick', 'licked'),
  slap: new UserInteraction('slap', 'slapped'),
  punch: new UserInteraction('punch', 'punched'),
  boop: new UserInteraction('boop', 'booped'),
  tickle: new UserInteraction('tickle', 'tickled'),
};

export const userActions: UserActions = {
  help: {
    command: 'help',
    help: '/help: ...shows help.',
    run(sender) {
      const chatResponses: ChatResponse[] = [
        generateChatResponse('User commands are:', sender),
      ];
      Object.keys(userActions).forEach((key) => {
        chatResponses.push(generateChatResponse(userActions[key].help, sender));
      });
      Object.keys(userInteractions).forEach((key) => {
        chatResponses.push(
          generateChatResponse(userInteractions[key].help, sender),
        );
      });
      return chatResponses;
    },
  },
  roll: {
    command: 'roll',
    help:
      '/roll <optional number>: returns a random number between 1 and 10 or 1 and positive integer.',
    run(sender, subject) {
      let num = Number(subject);
      if (!num && num !== 0) {
        num = 10;
      }
      if (num > 0 && Number.isInteger(num)) {
        return [
          generateChatResponse(
            (Math.floor(Math.random() * num) + 1).toString(),
            sender,
          ),
        ];
      }
      return [
        generateChatResponse(`${num} is not a valid positive integer.`, sender),
      ];
    },
  },
};
