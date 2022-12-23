import Assassin from './roles/assassin';
import Merlin from './roles/merlin';
import Percival from './roles/percival';
import Morgana from './roles/morgana';
import Oberon from './roles/oberon';
import Isolde from './roles/isolde';
import Tristan from './roles/tristan';
import Resistance from './roles/resistance';
import Spy from './roles/spy';
import Mordred from './roles/mordred';

const roles = {
  [Resistance.role]: Resistance,
  [Spy.role]: Spy,

  [Assassin.role]: Assassin,
  [Merlin.role]: Merlin,
  [Percival.role]: Percival,
  [Morgana.role]: Morgana,

  [Oberon.role]: Oberon,
  [Isolde.role]: Isolde,
  [Mordred.role]: Mordred,
  [Tristan.role]: Tristan,
};

export const getRoles = function (thisRoom) {
  const obj = {};

  // No good way to map over an object, so we do this iteratively.
  // Note this implementation leads to a limitation of one role per game.
  // Not great...!
  // TODO
  for (const [roleName, roleClass] of Object.entries(roles)) {
    obj[roleName] = new roleClass(thisRoom);
  }

  return obj;
};
