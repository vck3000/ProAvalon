import MTest from './commands/mtest';
import { Command } from '../commands.types';
import MHelp from './commands/mhelp';

const ModCommands: Record<string, Command> = {
  [MHelp.command]: MHelp,
  [MTest.command]: MTest,
};

export default ModCommands;
