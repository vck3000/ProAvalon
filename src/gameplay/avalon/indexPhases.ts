import Assassination from './phases/assassination';
import Lady from './phases/lady';
import Ref from './phases/ref';
import Sire from './phases/sire';

export const avalonPhases = {
  [Assassination.phase]: Assassination,
  [Lady.phase]: Lady,
  [Ref.phase]: Ref,
  [Sire.phase]: Sire,
};
