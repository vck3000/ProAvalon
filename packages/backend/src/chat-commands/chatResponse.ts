import {
  // SocketEvents,
  ChatResponse,
  ChatResponseType,
} from '../../proto/lobbyProto';
import RedisAdapter from '../util/redisAdapter';
import { SocketUser } from '../users/users.socket';

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
  const redisAdapter = new RedisAdapter();
  // eslint-disable-next-line no-console
  console.log(redisAdapter.server, text, socket.user.displayUsername);
  // .to(socket.user.id)
  // .emit(
  //   SocketEvents.ALL_CHAT_TO_CLIENT,
  //   generateChatResponse(text, socket.user.displayUsername),
  // );
};
