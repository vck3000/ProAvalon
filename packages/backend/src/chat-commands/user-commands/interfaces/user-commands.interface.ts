import { SocketUser } from '../../../users/users.socket';

export interface UserCommand {
  command: string;
  help: string;
  run: (data: string[], senderSocket: SocketUser) => void;
}
