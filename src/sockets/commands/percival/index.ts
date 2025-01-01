import { Commands } from '../types';
import { convertModCommandToPercivalCommand } from '../helperFunctions';
import { p } from './p';
import { mdc } from '../mod/mdc';

const pdc = convertModCommandToPercivalCommand(mdc);

export const percivalCommands: Commands = {
  [p.command]: p,
  [pdc.command]: pdc,
};
