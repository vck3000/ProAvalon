import { Command } from './types';

export function createCommandWithNewPrefix(
  command: Command,
  oldPrefix: string,
  newPrefix: string,
): Command {
  // Throw error if invalid command is passed
  if (!command.command.startsWith(oldPrefix)) {
    throw new Error(`Incorrect command prefix. Expected: ${oldPrefix}`);
  }

  if (!command.help.startsWith(`/${oldPrefix}`)) {
    throw new Error(`Incorrect command help prefix. Expected: /${oldPrefix}`);
  }

  return {
    command: command.command.replace(oldPrefix, newPrefix),
    help: command.help.replace(oldPrefix, newPrefix),
    run: command.run,
  };
}
