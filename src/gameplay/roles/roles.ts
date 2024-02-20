import Assassin from './avalon/assassin';
import Merlin from './avalon/merlin';
import Percival from './avalon/percival';
import Morgana from './avalon/morgana';
import Oberon from './avalon/oberon';
import Isolde from './avalon/isolde';
import Tristan from './avalon/tristan';
import Resistance from './avalon/resistance';
import Spy from './avalon/spy';
import Mordred from './avalon/mordred';

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
