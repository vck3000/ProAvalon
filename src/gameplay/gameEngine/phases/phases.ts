import Finished from './common/finished';
import Frozen from './common/frozen';
import Paused from './common/paused';
import Voided from './common/voided';
import PickingTeam from './common/pickingTeam';
import VotingMission from './common/votingMission';
import VotingTeam from './common/votingTeam';

import Assassination from './avalon/assassination';
import Lady from './avalon/lady';
import Ref from './avalon/ref';
import Sire from './avalon/sire';

export const commonPhases = {
  [Finished.phase]: Finished,
  [Frozen.phase]: Frozen,
  [Paused.phase]: Paused,
  [Voided.phase]: Voided,
  [PickingTeam.phase]: PickingTeam,
  [VotingMission.phase]: VotingMission,
  [VotingTeam.phase]: VotingTeam,
};

export const avalonPhases = {
  [Assassination.phase]: Assassination,
  [Lady.phase]: Lady,
  [Ref.phase]: Ref,
  [Sire.phase]: Sire,
};
