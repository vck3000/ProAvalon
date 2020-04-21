import MTest from './commands/mtest';
import { Command } from '../commands.types';

const ModCommands: Record<string, Command> = {};

ModCommands[MTest.command] = MTest;

export default ModCommands;
