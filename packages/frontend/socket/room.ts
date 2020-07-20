import { transformAndValidate } from '@proavalon/proto';
import { SocketEvents } from '@proavalon/proto/lobby';
import { RoomData } from '@proavalon/proto/room';
import { store } from '../store';
import { setRoom } from '../store/room/actions';

export const SetRoomEvents = (socket: SocketIOClient.Socket): void => {
  socket.on(SocketEvents.UPDATE_ROOM, async (roomData: RoomData) => {
    try {
      const roomDataValidated = await transformAndValidate(RoomData, roomData);
      store.dispatch(setRoom(roomDataValidated));

      console.log('Received room data'); // eslint-disable-line
      console.log(roomDataValidated); // eslint-disable-line
    } catch (err) {
      throw Error(`Validation failed. Error: ${err}`);
    }
  });
};
