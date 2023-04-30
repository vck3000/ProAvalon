import Entity from './roles/entity';

export class Player {
  username: string;
  entity: Entity;

  constructor(username: string, entity: Entity) {
    this.username = username.toLowerCase();
    this.entity = entity;
  }
}
