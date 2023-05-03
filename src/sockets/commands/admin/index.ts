import { a } from './a';
import { aemailtousername } from './aemailtousername';
import { aip } from './aip';
import { aresetpassword } from './aresetpassword';
import { Commands } from '../types';
import { atestgame } from './atestgame';
import { acreatetestaccounts } from './acreatetestaccounts';
import { astartnewrankseason } from './astartnewrankseason';

export const adminCommands: Commands = {
  [a.command]: a,
  [aemailtousername.command]: aemailtousername,
  [aip.command]: aip,
  [aresetpassword.command]: aresetpassword,
  [atestgame.command]: atestgame,
  [acreatetestaccounts.command]: acreatetestaccounts,
  [astartnewrankseason.command]: astartnewrankseason,
};
