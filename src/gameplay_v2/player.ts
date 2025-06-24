import Entity from './roles/entity';

export class Player {
  username: string; // Lowercase!!
  entity: Entity;

  constructor(username: string, entity: Entity) {
    this.username = username;
    this.entity = entity;
  }
}
