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
