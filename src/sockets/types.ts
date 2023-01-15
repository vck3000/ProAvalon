import { Socket } from 'socket.io';
import User, { UserDocument } from '../models/user';

export type SocketUser = Socket & {
  request: {
    user: typeof User & UserDocument;
  };
};
