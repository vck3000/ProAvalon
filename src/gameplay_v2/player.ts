import Entity from './roles/entity';
import { Role, Alliance } from './gameTypes';

export class Player {
  username: string;
  // entity: Entity;

  // 14/5/2023: change constuctor from only accept entity to accept both
  // Alliance and Role data. These two types are in enum format and 
  // Be defined in gameTypes.ts
  // The reason to do it is because the original version of code has a bug: the
  // Input from gameEngine.ts and entity.ts are inconsistance. which will cause
  // After get playerdata and we cannot know what role of it. This changes can fix this bug
  // If Player is fixed with other entity , feel free to add the fourth parameter in constructor.

  alliance: Alliance;
  role: Role

  // constructor(username: string, entity: Entity) {
  constructor(username: string, alliance: Alliance, role: Role) {
    this.username = username.toLowerCase();
    // this.entity = entity;
    this.alliance = alliance;
    this.role = role;
  }
}
