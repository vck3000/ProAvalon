import { Commands } from '../types';
import { help } from './help';
import { roll } from './roll';
import { navbar } from './navbar';

export const userCommands: Commands = {
  [help.command]: help,
  [navbar.command]: navbar,
  [roll.command]: roll,
};
