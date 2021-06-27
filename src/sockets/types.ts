import { Socket } from 'socket.io';
import User from '../models/user';

export type SocketUser = Socket & {
  request: {
    user: typeof User;
  };
};
