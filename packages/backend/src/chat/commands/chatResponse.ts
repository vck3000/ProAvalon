import {
  // SocketEvents,
  ChatResponse,
  ChatResponseType,
  SocketEvents,
} from '../../../proto/lobbyProto';
import { SocketUser } from '../../users/users.socket';

export const generateChatResponse = (
  text: ChatResponse['text'],
  username: ChatResponse['username'],
): ChatResponse => ({
  text,
  username,
  timestamp: new Date(),
  type: ChatResponseType.USER_COMMAND,
});

export const emitChatResponse = (text: string, socket: SocketUser) => {
  socket.emit(
    SocketEvents.ALL_CHAT_TO_CLIENT,
    generateChatResponse(text, socket.user.displayUsername),
  );
};
