import { transformAndValidate } from '@proavalon/proto';
import { LobbySocketEvents, ChatResponse } from '@proavalon/proto/lobby';
import { RoomSocketEvents } from '@proavalon/proto/room';
import { store } from '../store';
import { receivedMessage } from '../store/chat/actions';

export const SetSocketChatEvents = (socket: SocketIOClient.Socket): void => {
  socket.on(
    LobbySocketEvents.ALL_CHAT_TO_CLIENT,
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
    RoomSocketEvents.ROOM_CHAT_TO_CLIENT,
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
