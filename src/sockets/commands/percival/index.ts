import { Command, Commands } from '../types';
import { p } from './p';
import { mdc } from '../mod/mdc';

// Percival commands are intended to be a strict subset of mod commands.

export function convertModCommandToPercivalCommand(
  modCommand: Command,
): Command {
  const modPrefix = 'm';
  const percivalPrefix = 'p';

  // Throw error if invalid command is passed
  if (!modCommand.command.startsWith(modPrefix)) {
    throw new Error(`Incorrect command prefix. Expected: ${modPrefix}`);
  }

  if (!modCommand.help.startsWith(`/${modPrefix}`)) {
    throw new Error(
      `Incorrect command help prefix. Expected: /${modPrefix}`,
    );
  }

  return {
    command: modCommand.command.replace(
      modPrefix,
      percivalPrefix,
    ),
    help: modCommand.help.replace(modPrefix, percivalPrefix),
    run: modCommand.run,
  };
}

const pdc = convertModCommandToPercivalCommand(mdc);

export const percivalCommands: Commands = {
  [p.command]: p,
  [pdc.command]: pdc,
};
