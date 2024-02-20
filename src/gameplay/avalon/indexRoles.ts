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

export const avalonRoles = {
  [Resistance.role.toLowerCase()]: Resistance,
  [Spy.role.toLowerCase()]: Spy,

  [Assassin.role.toLowerCase()]: Assassin,
  [Merlin.role.toLowerCase()]: Merlin,
  [Percival.role.toLowerCase()]: Percival,
  [Morgana.role.toLowerCase()]: Morgana,

  [Oberon.role.toLowerCase()]: Oberon,
  [Isolde.role.toLowerCase()]: Isolde,
  [Mordred.role.toLowerCase()]: Mordred,
  [Tristan.role.toLowerCase()]: Tristan,
};
