import { Lobby } from '@proavalon/proto';
import SocketEvents = Lobby.SocketEvents;
import ChatResponse = Lobby.ChatResponse;
import ChatResponseType = Lobby.ChatResponseType;
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
