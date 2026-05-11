import { Commands, Command } from '../types';
import { t } from './t';
import { mforcemove } from '../mod/mforcemove';
import { mrevealallroles } from '../mod/mrevealallroles';
import { mtogglepause } from '../mod/mtogglepause';
import { mwhisper } from '../mod/mwhisper';

export function convertModCommandToTOCommand(
  modCommand: Command,
): Command {
  const modPrefix = 'm';
  const TOPrefix = 't';

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
      TOPrefix,
    ),
    help: modCommand.help.replace(modPrefix, TOPrefix),
    run: modCommand.run,
  };
}

const tforcemove = convertModCommandToTOCommand(mforcemove);
const trevealallroles = convertModCommandToTOCommand(mrevealallroles);
const ttogglepause = convertModCommandToTOCommand(mtogglepause);
const twhisper = convertModCommandToTOCommand(mwhisper);

export const TOCommands: Commands = {
    [t.command]: t,
    [tforcemove.command]: tforcemove,
    [trevealallroles.command]: trevealallroles,
    [ttogglepause.command]: ttogglepause,
    [twhisper.command]: twhisper,
};
