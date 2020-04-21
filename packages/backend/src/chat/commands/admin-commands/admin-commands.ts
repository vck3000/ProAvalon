import ATest from './commands/atest';
import { Command } from '../commands.types';
import AHelp from './commands/ahelp';

const AdminCommands: Record<string, Command> = {
  [AHelp.command]: AHelp,
  [ATest.command]: ATest,
};

export default AdminCommands;
