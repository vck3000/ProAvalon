import Help from './commands/help';
import Roll from './commands/roll';
import { userInteractions } from './commands/userInteractions';
import { Command } from '../commands.types';

const UserCommands: Record<string, Command> = {
  ...userInteractions,
  [Help.command]: Help,
  [Roll.command]: Roll,
};

export default UserCommands;
