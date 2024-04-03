import { Commands } from '../types';
import { help } from './help';

export const userCommands: Commands = {
  [help.command]: help,
};
