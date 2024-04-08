import { Commands } from '../types';
import { help } from './help';
import { roll } from './roll';
import { navbar } from './navbar';
import { pausetimer } from './pausetimer';
import { unpausetimer } from './unpausetimer';
import { voidgame } from './voidgame';
import { addblacklist } from './addblacklist';
import { removeblacklist } from './removeblacklist';
import { getblacklist } from './getblacklist';

export const userCommandsImported: Commands = {
  [help.command]: help,
  [navbar.command]: navbar,
  [roll.command]: roll,
  [unpausetimer.command]: unpausetimer,
  [pausetimer.command]: pausetimer,
  [voidgame.command]: voidgame,
  [addblacklist.command]: addblacklist,
  [removeblacklist.command]: removeblacklist,
  [getblacklist.command]: getblacklist,
};
