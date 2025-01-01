import { Command } from './types';

enum CommandPrefix {
  Mod = 'm',
  Percival = 'p',
}

export function convertModCommandToPercivalCommand(
  modCommand: Command,
): Command {
  // Throw error if invalid command is passed
  if (!modCommand.command.startsWith(CommandPrefix.Mod)) {
    throw new Error(`Incorrect command prefix. Expected: ${CommandPrefix.Mod}`);
  }

  if (!modCommand.help.startsWith(`/${CommandPrefix.Mod}`)) {
    throw new Error(
      `Incorrect command help prefix. Expected: /${CommandPrefix.Mod}`,
    );
  }

  return {
    command: modCommand.command.replace(
      CommandPrefix.Mod,
      CommandPrefix.Percival,
    ),
    help: modCommand.help.replace(CommandPrefix.Mod, CommandPrefix.Percival),
    run: modCommand.run,
  };
}
