import { Alliance } from '@proavalon/proto/game';
import { Entity } from './game-entity';
import {
  CSeeAlliance,
  CAssassin,
  CRole,
  CAlliance,
  CVoteTeam,
  CVoteMission,
} from './game-components';

export enum ROLES {
  RESISTANCE = 'resistance',
  SPY = 'spy',
  MERLIN = 'merlin',
  ASSASSIN = 'assassin',
}

const GamePlayer = (entity: Entity): void => {
  entity.addComponent(new CVoteTeam());
  entity.addComponent(new CVoteMission());
};

const Resistance = (entity: Entity): void => {
  GamePlayer(entity);
  entity.addComponent(new CAlliance(Alliance.resistance));
};

const Spy = (entity: Entity): void => {
  GamePlayer(entity);
  entity.addComponent(new CAlliance(Alliance.spy));
};

const Merlin = (entity: Entity): void => {
  Resistance(entity);
  entity.addComponent(new CRole(ROLES.MERLIN));
  entity.addComponent(new CSeeAlliance('all'));
};

const Assassin = (entity: Entity): void => {
  Spy(entity);
  entity.addComponent(new CRole(ROLES.ASSASSIN));
  entity.addComponent(new CAssassin());
};

export const addRoles = {
  Resistance,
  Spy,
  Merlin,
  Assassin,
};
