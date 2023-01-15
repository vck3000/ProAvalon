import { Socket } from 'socket.io';
import User, { UserDocument } from '../models/user';

interface SocketUserAdditions {
  inRoomId?: number;
}

export type SocketUser = Socket & {
  request: {
    user: typeof User & UserDocument & SocketUserAdditions;
  };
};
