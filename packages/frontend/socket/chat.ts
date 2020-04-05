import socket from './socket';
import { ChatResponse } from '../proto/bundle';
import SocketEvents from '../proto/socketEvents';
import { store } from '../store';
import { receivedMessage } from '../store/chat/actions';

// eslint-disable-next-line import/prefer-default-export
export const SetSocketChat = (): void => {
  socket.on(SocketEvents.ALL_CHAT_TO_CLIENT, (message: Buffer) => {
    const chatResponse = ChatResponse.decode(new Uint8Array(message));
    store.dispatch(receivedMessage(chatResponse));
  });
};
