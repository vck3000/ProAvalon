import { IRole, Role } from './types';
import { Alliance } from '../types';

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
import MordredAssassin from './avalon/mordredassassin';
import Hitberon from './avalon/hitberon';
import Melron from './avalon/melron';
import Moregano from './avalon/moregano';


type Class<I, Args extends any[] = any[]> = new (...args: Args) => I;
export const avalonRoles: Record<string, Class<IRole>> = {
  [Resistance.role]: Resistance,
  [Spy.role]: Spy,

  [Assassin.role]: Assassin,
  [Merlin.role]: Merlin,
  [Percival.role]: Percival,
  [Morgana.role]: Morgana,

  [Mordred.role]: Mordred,
  [Oberon.role]: Oberon,

  [Isolde.role]: Isolde,
  [Tristan.role]: Tristan,

  [MordredAssassin.role]: MordredAssassin,
  [Hitberon.role]: Hitberon,

  [Melron.role]: Melron,
  [Moregano.role]: Moregano,

};

export const rolesThatCantGuessMerlin = [
  Role.Merlin,
  Role.Percival,
  Role.Assassin,
];

export const rolesToAlliances = Object.entries(avalonRoles).reduce<
  Record<string, string>
>((accumulator, [roleStr, role]) => {
  accumulator[roleStr] = new role(undefined).alliance;
  return accumulator;
}, {});

export const resRoles = Object.values(avalonRoles)
  .filter((role) => new role(undefined).alliance === Alliance.Resistance)
  .map((role) => new role(undefined).role);

export const spyRoles = Object.values(avalonRoles)
  .filter((role) => new role(undefined).alliance === Alliance.Spy)
  .map((role) => new role(undefined).role);
