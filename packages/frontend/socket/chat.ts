import { transformAndValidate, Lobby } from '@proavalon/proto';
import SocketEvents = Lobby.SocketEvents;
import ChatResponse = Lobby.ChatResponse;
import { store } from '../store';
import { receivedMessage } from '../store/chat/actions';

export const SetSocketChatEvents = (socket: SocketIOClient.Socket): void => {
  socket.on(
    SocketEvents.ALL_CHAT_TO_CLIENT,
    async (chatResponse: ChatResponse) => {
      try {
        const chatRes = await transformAndValidate(ChatResponse, chatResponse);
        store.dispatch(receivedMessage({ type: 'lobby', message: chatRes }));
      } catch (err) {
        throw Error(`Validation failed. Error: ${err}`);
      }
    },
  );

  socket.on(
    SocketEvents.GAME_CHAT_TO_CLIENT,
    async (chatResponse: ChatResponse): Promise<void> => {
      try {
        const chatRes = await transformAndValidate(ChatResponse, chatResponse);
        store.dispatch(receivedMessage({ type: 'game', message: chatRes }));
      } catch (err) {
        throw Error(`Validation failed. Error: ${err}`);
      }
    },
  );
};
