import { Commands } from '../types';
import { adjustCommandPrefix } from '../helperFunctions';
import { p } from './p';
import { mdc } from '../mod/mdc';

const pdc = adjustCommandPrefix(mdc, 'm', 'p');

export const percivalCommands: Commands = {
  [p.command]: p,
  [pdc.command]: pdc,
};
