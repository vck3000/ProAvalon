import { m } from './m';
import { mban } from './mban';
import { mgetban } from './mgetban';
import { Commands } from '../types';
import { munban } from './munban';
import { mcompareips } from './mcompareips';
import { mdc } from './mdc';
import { mnotify } from './mnotify';
import { mtoggleregistration } from './mtoggleregistration';
import { mtempenableregistration } from './mtempenableregistration';
import { mwhisper } from './mwhisper';
import { mremoveavatar } from './mremoveavatar';
import { mclose } from './mclose';
import { mannounce } from './mannounce';
import { mkill } from './mkill';
import { miplinkedaccs } from './miplinkedaccs';
import { mtogglepause } from './mtogglepause';
import { mrevealallroles } from './mrevealallroles';
import { mforcemove } from './mforcemove';
import { mpushavatartolibrary } from './mpushavatartolibrary';
import { msetavatar } from './msetavatar';
import { mresettournamentaccounts } from './mresettournamentaccounts';
import { mpromote } from './mpromote';
import { mdemote } from './mdemote';
import { mcleartos } from './mcleartos';
import { mallrole } from './mallrole';

export const modCommands: Commands = {
  [m.command]: m,
  [mban.command]: mban,
  [mgetban.command]: mgetban,
  [munban.command]: munban,
  [mcompareips.command]: mcompareips,
  [mdc.command]: mdc,
  [mnotify.command]: mnotify,
  [mtoggleregistration.command]: mtoggleregistration,
  [mtempenableregistration.command]: mtempenableregistration,
  [mpromote.command]: mpromote,
  [mdemote.command]: mdemote,
  [mcleartos.command]: mcleartos,
  [mallrole.command]: mallrole,
  [mresettournamentaccounts.command]: mresettournamentaccounts,
  [mwhisper.command]: mwhisper,
  [msetavatar.command]: msetavatar,
  [mremoveavatar.command]: mremoveavatar,
  [mpushavatartolibrary.command]: mpushavatartolibrary,
  [mclose.command]: mclose,
  [mannounce.command]: mannounce,
  [mkill.command]: mkill,
  [miplinkedaccs.command]: miplinkedaccs,
  [mtogglepause.command]: mtogglepause,
  [mrevealallroles.command]: mrevealallroles,
  [mforcemove.command]: mforcemove,
};
