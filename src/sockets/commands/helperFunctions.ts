import { Command } from './types';

export function adjustCommandPrefix(
  command: Command,
  oldPrefix: string,
  newPrefix: string,
): Command {
  // TODO-kev: Add checks to see if valid command

  const shallowCopy = { ...command };

  shallowCopy.command = shallowCopy.command.replace(oldPrefix, newPrefix);
  shallowCopy.help = shallowCopy.help.replace(oldPrefix, newPrefix);

  return shallowCopy;
}
