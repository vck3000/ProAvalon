import { RoomData } from '@proavalon/proto/room';
import { RoomActionTypes, SET_ROOM } from './types';

export const setRoom = (payload: RoomData): RoomActionTypes => {
  return {
    type: SET_ROOM,
    payload,
  };
};
