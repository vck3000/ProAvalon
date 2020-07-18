import { SocketUser } from '../users/users.socket';

export type SocketGame = Pick<SocketUser, 'user' | 'id'>;
