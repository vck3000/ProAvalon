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
import { SocketUser } from '../users/users.socket';

export enum ROLES {
  RESISTANCE = 'resistance',
  SPY = 'spy',
  MERLIN = 'merlin',
  ASSASSIN = 'assassin',
}

const Player = (gameECS: GameECS, socket: SocketUser): Entity => {
  const entity = gameECS.addEntity();
  entity.addComponent(new CPlayer(socket));
  entity.addComponent(new CVoteTeam());
  entity.addComponent(new CVoteMission());
  return entity;
};

const Resistance = (gameECS: GameECS, socket: SocketUser): Entity => {
  const entity = Player(gameECS, socket);
  entity.addComponent(new CAlliance('resistance'));
  return entity;
};

const Spy = (gameECS: GameECS, socket: SocketUser): Entity => {
  const entity = Player(gameECS, socket);
  entity.addComponent(new CAlliance('spy'));
  return entity;
};

const Merlin = (gameECS: GameECS, socket: SocketUser): Entity => {
  const entity = Resistance(gameECS, socket);
  entity.addComponent(new CRole(ROLES.MERLIN));
  entity.addComponent(new CSeeAlliance('all'));
  return entity;
};

const Assassin = (gameECS: GameECS, socket: SocketUser): Entity => {
  const entity = Spy(gameECS, socket);
  entity.addComponent(new CRole(ROLES.ASSASSIN));
  return entity;
};

export const createRoles = {
  resistance: Resistance,
  spy: Spy,
  merlin: Merlin,
  assassin: Assassin,
};
