import Finished from './commonPhases/finished';
import Frozen from './commonPhases/frozen';
import Paused from './commonPhases/paused';
import PickingTeam from './commonPhases/pickingTeam';
import VotingMission from './commonPhases/votingMission';
import VotingTeam from './commonPhases/votingTeam';

export const commonPhases = {
  [Finished.phase]: Finished,
  [Frozen.phase]: Frozen,
  [Paused.phase]: Paused,
  [PickingTeam.phase]: PickingTeam,
  [VotingMission.phase]: VotingMission,
  [VotingTeam.phase]: VotingTeam,
};
