import { Socket } from 'socket.io';
import { DocumentType } from '@typegoose/typegoose';
import { User } from './user.model';

export interface SocketUser extends Socket {
  user: DocumentType<User>;
  lastRoomId?: number;
}
