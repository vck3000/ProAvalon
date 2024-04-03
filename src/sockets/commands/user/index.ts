import { Commands } from '../types';
import { help } from './help';
import { roll } from './roll';

export const userCommands: Commands = {
  [help.command]: help,
  [roll.command]: roll,
};
