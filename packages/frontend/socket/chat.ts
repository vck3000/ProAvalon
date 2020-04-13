import { ChatResponse } from '../proto/bundle';
import SocketEvents from '../proto/socketEvents';
import { store } from '../store';
import { receivedMessage } from '../store/chat/actions';

export const SetSocketChatEvents = (socket: SocketIOClient.Socket): void => {
  socket.on(SocketEvents.ALL_CHAT_TO_CLIENT, (message: Buffer) => {
    const chatResponse = ChatResponse.decode(new Uint8Array(message));
    store.dispatch(receivedMessage(chatResponse));
  });
};
