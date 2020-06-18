import { Entity } from './game-entity';
import {
  CPlayer,
  CSeeAlliance,
  CRole,
  CAlliance,
  CVoteTeam,
  CVoteMission,
} from './game-components';
import GameECS from './game-ecs';

export enum ROLES {
  MERLIN = 'merlin',
  ASSASSIN = 'assassin',
  PERCIVAL = 'percival',
  MORGANA = 'morgana',
}

const Player = (gameECS: GameECS): Entity => {
  const entity = gameECS.createEntity();
  entity.addComponent(new CPlayer());
  entity.addComponent(new CVoteTeam());
  entity.addComponent(new CVoteMission());
  return entity;
};

export const Resistance = (gameECS: GameECS): Entity => {
  const entity = Player(gameECS);
  entity.addComponent(new CAlliance('resistance'));
  return entity;
};

export const Spy = (gameECS: GameECS): Entity => {
  const entity = Player(gameECS);
  entity.addComponent(new CAlliance('spy'));
  return entity;
};

export const Merlin = (gameECS: GameECS): Entity => {
  const entity = Resistance(gameECS);
  entity.addComponent(new CRole(ROLES.MERLIN));
  entity.addComponent(new CSeeAlliance('all'));
  return entity;
};

export const Assassin = (gameECS: GameECS): Entity => {
  const entity = Spy(gameECS);
  entity.addComponent(new CRole(ROLES.ASSASSIN));
  return entity;
};
