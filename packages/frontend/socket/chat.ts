import { SocketEvents, ChatResponse } from '../proto/lobbyProto';
import { store } from '../store';
import { receivedMessage } from '../store/chat/actions';

export const SetSocketChatEvents = (socket: SocketIOClient.Socket): void => {
  socket.on(SocketEvents.ALL_CHAT_TO_CLIENT, (chatResponse: ChatResponse) => {
    store.dispatch(
      receivedMessage({
        ...chatResponse,
        timestamp: new Date(chatResponse.timestamp),
      }),
    );
  });
};
