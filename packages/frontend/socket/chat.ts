import socket from './socket';
import { IMessage } from '../store/chat/types';
import { store } from '../store';
import { receivedMessage } from '../store/chat/actions';

// eslint-disable-next-line import/prefer-default-export
export const SetSocketChat = (): void => {
  socket.on('allChatToClient', (message: IMessage) => {
    store.dispatch(receivedMessage(message));
  });
};
