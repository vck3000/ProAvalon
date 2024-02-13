import Assassination from './phases/assassination';
import Lady from './phases/lady';
import Ref from './phases/ref';
import Sire from './phases/sire';

const phases = {
  [Assassination.phase]: Assassination,
  [Lady.phase]: Lady,
  [Ref.phase]: Ref,
  [Sire.phase]: Sire,
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
