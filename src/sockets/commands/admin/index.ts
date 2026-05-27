import { a } from './a';
import { aemailtousername } from './aemailtousername';
import { aip } from './aip';
import { aresetpassword } from './aresetpassword';
import { Command, Commands } from '../types';
import { atestgame } from './atestgame';
import { adiscordmessage } from './adiscordmessage';
import { acreatetestaccounts } from './acreatetestaccounts';
import { ausernametoemail } from './ausernametoemail';
import { asessions } from './asessions';
import { msiterole } from '../mod/msiterole';

// Delete the below following season update. Purely for testing purposes
import { acreateseason } from './acreateseason';
import { agetcurrentseason } from './agetcurrentseason';
import { agetstat, aupdatestat } from './acreatestat';
import { atogglecreateroom } from './atogglecreateroom';

const debugCommands =
  process.env.ENV === 'local'
    ? {
        [acreateseason.command]: acreateseason,
        [agetcurrentseason.command]: agetcurrentseason,
        [agetstat.command]: agetstat,
        [aupdatestat.command]: aupdatestat,
      }
    : {};

export function convertModCommandToAdminCommand(
  modCommand: Command,
): Command {
  const modPrefix = 'm';
  const adminPrefix = 'a';

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
      adminPrefix,
    ),
    help: modCommand.help.replace(modPrefix, adminPrefix),
    run: modCommand.run,
  };
}

const asiterole = convertModCommandToAdminCommand(msiterole);

export const adminCommands: Commands = {
  [a.command]: a,
  [acreatetestaccounts.command]: acreatetestaccounts,
  [adiscordmessage.command]: adiscordmessage,
  [aemailtousername.command]: aemailtousername,
  [aip.command]: aip,
  [aresetpassword.command]: aresetpassword,
  [atestgame.command]: atestgame,
  [asessions.command]: asessions,
  [ausernametoemail.command]: ausernametoemail,
  [atogglecreateroom.command]: atogglecreateroom,
  [asiterole.command]: asiterole,
  ...debugCommands,
};
