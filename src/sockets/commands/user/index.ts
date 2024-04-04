import { Commands } from '../types';
import { help } from './help';
import { roll } from './roll';
import { navbar } from './navbar';
import { pausetimer } from './pausetimer';
import { unpausetimer } from './unpausetimer';
import { voidgame } from './voidgame';

export const userCommandsImported: Commands = {
  [help.command]: help,
  [navbar.command]: navbar,
  [pausetimer.command]: pausetimer,
  [roll.command]: roll,
  [unpausetimer.command]: unpausetimer,
  [voidgame.command]: voidgame,
};
