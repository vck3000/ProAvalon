import Finished from './commonPhases/finished';

const phases = {
  [Finished.phase.toLowerCase()]: Finished,
  [Lady.phase.toLowerCase()]: Lady,
  [Ref.phase.toLowerCase()]: Ref,
  [Sire.phase.toLowerCase()]: Sire,
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
