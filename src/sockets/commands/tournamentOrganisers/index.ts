import { Commands } from '../types';
import { taward } from './taward';
import { tclearawards } from './tclearawards';
import { tremoveaward } from './tremoveaward';

export const TOCommandsImported: Commands = {
    [taward.command]: taward,
    [tclearawards.command]: tclearawards,
    [tremoveaward.command]: tremoveaward,
};
