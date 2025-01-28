import { a } from './a';
import { aemailtousername } from './aemailtousername';
import { aip } from './aip';
import { aresetpassword } from './aresetpassword';
import { Commands } from '../types';
import { atestgame } from './atestgame';
import { adiscordmessage } from './adiscordmessage';
import { acreatetestaccounts } from './acreatetestaccounts';
import { aresettournamentaccounts } from './aresettournamentaccounts';
import { ausernametoemail } from './ausernametoemail';
import { asessions } from './asessions';

// TODO-kev: Delete the below. Purely for testing purposes
import { acreateseason } from './acreateseason';
import { agetcurrentseason } from './agetcurrentseason';
import { agetstat, aupdatestat } from './acreatestat';

export const adminCommands: Commands = {
  [a.command]: a,
  [acreatetestaccounts.command]: acreatetestaccounts,
  [adiscordmessage.command]: adiscordmessage,
  [aemailtousername.command]: aemailtousername,
  [aip.command]: aip,
  [aresettournamentaccounts.command]: aresettournamentaccounts,
  [aresetpassword.command]: aresetpassword,
  [atestgame.command]: atestgame,
  [asessions.command]: asessions,
  [ausernametoemail.command]: ausernametoemail,

  // TODO-kev: Update below following season update. These commands need to be fixed
  ...(process.env.ENABLE_SEASON === 'true' && {
    [acreateseason.command]: acreateseason,
    [agetcurrentseason.command]: agetcurrentseason,
    [agetstat.command]: agetstat,
    [aupdatestat.command]: aupdatestat,
  }),
};
