import { Commands } from '../types';
import { createCommandWithNewPrefix } from '../helperFunctions';
import { p } from './p';
import { mdc } from '../mod/mdc';

const pdc = createCommandWithNewPrefix(mdc, 'm', 'p');

export const percivalCommands: Commands = {
  [p.command]: p,
  [pdc.command]: pdc,
};
