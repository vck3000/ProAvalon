import { Injectable } from '@nestjs/common';
import { ChatResponse, ChatResponseType } from '../../../proto/lobbyProto';
import { userActions, userInteractions } from './user-commands';

export interface UserCommand {
  verb: string;
  subject: string;
  sender: string;
  subjectId: string | null;
}

export const generateChatResponse = (
  text: ChatResponse['text'],
  username: ChatResponse['username'],
): ChatResponse => ({
  text,
  username,
  timestamp: new Date(),
  type: ChatResponseType.USER_COMMAND,
});

@Injectable()
export class UserCommandsService {
  getCommand({
    verb,
    subject,
    sender,
    subjectId,
  }: UserCommand): ChatResponse[] {
    if (userActions[verb]) {
      return userActions[verb].run(sender, subject);
    }
    if (userInteractions[verb]) {
      if (subjectId) {
        return userInteractions[verb].run(sender, subject);
      }

      return [generateChatResponse(`User ${subject} does not exist.`, sender)];
    }
    return [generateChatResponse('Invalid command.', sender)];
  }
}
