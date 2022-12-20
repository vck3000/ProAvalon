import { SocketUser } from '../sockets/types';

export interface Command {
  command: string,
  help: string,
  run: (args: string[], socket: SocketUser) => Promise<void>,
}
