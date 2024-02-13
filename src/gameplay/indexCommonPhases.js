import Finished from './commonPhases/finished';
import Frozen from './commonPhases/frozen';
import Paused from './commonPhases/paused';
import PickingTeam from './commonPhases/pickingTeam';
import VotingMission from './commonPhases/votingMission';
import VotingTeam from './commonPhases/votingTeam';

const phases = {
  [Finished.phase]: Finished,
  [Frozen.phase]: Frozen,
  [Paused.phase]: Paused,
  [PickingTeam.phase]: PickingTeam,
  [VotingMission.phase]: VotingMission,
  [VotingTeam.phase]: VotingTeam,
};

export const getPhases = function (thisRoom) {
  const obj = {};

  // No good way to map over an object, so we do this iteratively.
  // Note this implementation leads to a limitation of one role per game.
  // Not great...!
  // TODO
  for (const [phaseName, phaseClass] of Object.entries(phases)) {
    obj[phaseName] = new phaseClass(thisRoom);
  }

  return obj;
};
