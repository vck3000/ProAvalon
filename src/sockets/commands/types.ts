import { SocketUser } from '../types';

export interface Commands{
  [Command: string]: Command;
} 

export interface Command {
  command: string,
  help: string,
  run: (args: string[], socket: SocketUser) => Promise<void>,
}
