import { Commands } from '../types';
import { mdc } from '../mod/mdc';
import { adjustCommandPrefix } from '../helperFunctions';

const pdc = adjustCommandPrefix(mdc, 'm', 'p');

export const percivalCommands: Commands = {
  [pdc.command]: pdc,
};
