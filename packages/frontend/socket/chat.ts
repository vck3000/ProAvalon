import { transformAndValidate } from 'class-transformer-validator';
import { SocketEvents, ChatResponse } from '../proto/lobbyProto';
import { store } from '../store';
import { receivedMessage } from '../store/chat/actions';

export const SetSocketChatEvents = (socket: SocketIOClient.Socket): void => {
  socket.on(
    SocketEvents.ALL_CHAT_TO_CLIENT,
    async (chatResponse: ChatResponse) => {
      try {
        const chatRes = await transformAndValidate(ChatResponse, chatResponse);
        store.dispatch(receivedMessage(chatRes));
      } catch (err) {
        throw Error(`Validation failed. Error: ${err}`);
      }
    },
  );
};
