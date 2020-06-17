import { Entity } from './game-entity';
import {
  ComponentPlayer,
  ComponentSeeAlliance,
  ComponentRole,
  ComponentAlliance,
  ComponentVoteTeam,
  ComponentVoteMission,
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
  entity.addComponent(new ComponentPlayer());
  entity.addComponent(new ComponentVoteTeam());
  entity.addComponent(new ComponentVoteMission());
  return entity;
};

export const Resistance = (gameECS: GameECS): Entity => {
  const entity = Player(gameECS);
  entity.addComponent(new ComponentAlliance('resistance'));
  return entity;
};

export const Spy = (gameECS: GameECS): Entity => {
  const entity = Player(gameECS);
  entity.addComponent(new ComponentAlliance('spy'));
  return entity;
};

export const Merlin = (gameECS: GameECS): Entity => {
  const entity = Resistance(gameECS);
  entity.addComponent(new ComponentRole(ROLES.MERLIN));
  entity.addComponent(new ComponentSeeAlliance('all'));
  return entity;
};

export const Assassin = (gameECS: GameECS): Entity => {
  const entity = Spy(gameECS);
  entity.addComponent(new ComponentRole(ROLES.ASSASSIN));
  return entity;
};
