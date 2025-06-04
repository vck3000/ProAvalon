import { Command, Commands } from '../types';
import { p } from './p';
import { mdc } from '../mod/mdc';
import { mforcemove } from '../mod/mforcemove';
import { mclose } from '../mod/mclose';
import { pban } from './pban';

// Percival commands are intended to be a strict subset of mod commands.

export function convertModCommandToPercivalCommand(
  modCommand: Command,
): Command {
  const modPrefix = 'm';
  const percivalPrefix = 'p';

  // Throw error if invalid command is passed
  if (!modCommand.command.startsWith(modPrefix)) {
    throw new Error(`Incorrect command prefix. Expected to start with: "${modPrefix}" Got: "${modCommand.command}"`);
  }

  if (!modCommand.help.startsWith(`/${modPrefix}`)) {
    throw new Error(
      `Incorrect command help prefix. Expected to start with: "/${modPrefix}" Got: "${modCommand.help}"`,
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
const pforcemove = convertModCommandToPercivalCommand(mforcemove);
const pclose = convertModCommandToPercivalCommand(mclose);

export const percivalCommands: Commands = {
  [p.command]: p,
  [pban.command]: pban,
  [pdc.command]: pdc,
  [pforcemove.command]: pforcemove,
  [pclose.command]: pclose,
};
