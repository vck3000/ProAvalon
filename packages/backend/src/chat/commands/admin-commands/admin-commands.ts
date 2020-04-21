import ATest from './commands/atest';
import { Command } from '../commands.types';

const AdminCommands: Record<string, Command> = {};

AdminCommands[ATest.command] = ATest;

export default AdminCommands;
