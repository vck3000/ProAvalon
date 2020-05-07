import {
  // SocketEvents,
  ChatResponse,
  ChatResponseType,
  SocketEvents,
} from '../../proto/lobbyProto';
import { SocketUser } from '../users/users.socket';

export const generateCommandResponse = (
  text: ChatResponse['text'],
  username: ChatResponse['username'],
): ChatResponse => ({
  text,
  username,
  timestamp: new Date(),
  type: ChatResponseType.USER_COMMAND,
});

export const emitCommandResponse = (text: string, socket: SocketUser) => {
  socket.emit(
    SocketEvents.ALL_CHAT_TO_CLIENT,
    generateCommandResponse(text, socket.user.displayUsername),
  );
};
