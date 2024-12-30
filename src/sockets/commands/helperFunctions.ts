import { Command } from './types';

export function adjustCommandPrefix(
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

  const shallowCopy = { ...command };

  shallowCopy.command = shallowCopy.command.replace(oldPrefix, newPrefix);
  shallowCopy.help = shallowCopy.help.replace(oldPrefix, newPrefix);

  return shallowCopy;
}
