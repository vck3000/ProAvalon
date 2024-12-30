import { Commands } from '../types';
import { mdc } from '../mod/mdc';

export const percivalCommands: Commands = {
  [mdc.command]: mdc,
};
