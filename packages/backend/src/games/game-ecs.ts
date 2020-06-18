/* eslint-disable max-classes-per-file */
/*
   Ideas for the ECS

   Each entity is made up of a number of different components.

   A component is a feature, such as a colour, a position, an ability, etc.


   Each role that we have in The Resistance has an alliance, an ability to vote
   on teams, an ability to vote on missions, can use action cards, have a unique
   displayUsername they are tied with, a role name.
*/
import { GameEvent, GameEvents } from '@proavalon/proto/game';
import { Entity } from './game-entity';
import { System, EventVoteTeam } from './game-systems';
import { createRoles } from './game-assemblages';
import { SocketUser } from '../users/users.socket';

export default class GameECS {
  count: number;
  entities: Entity[];
  systems: System[];

  constructor() {
    this.count = 0;
    this.entities = [];
    this.systems = [];
  }

  addEntity() {
    // Create a new entity, push to entities, and then return the new entity.
    this.count += 1;
    this.entities.push(new Entity(this.count));
    return this.entities[this.entities.length - 1];
  }

  addSystem(system: System) {
    this.systems.push(system);
    // TODO: Do we need to sort systems by priority later?
  }

  addEntityRole(role: keyof typeof createRoles, socket: SocketUser) {
    return createRoles[role](this, socket);
  }

  async event(socket: SocketUser, gameEvent: GameEvent) {
    if (gameEvent.type) {
      switch (gameEvent.type) {
        case GameEvents.PICK:
          break;
        case GameEvents.VOTE_TEAM:
          await EventVoteTeam(this, socket, gameEvent.data);
          break;
        case GameEvents.VOTE_MISSION:
          break;
        default:
          // TODO: log a warning message
          console.warn('Game event type not recognised');
          break;
      }
    } else {
      // TODO: Make this into a logger warning later
      console.warn('Bad gameEvent object');
      throw new Error('bad event type');
    }

    this.update();
  }

  // Run each system
  update() {
    this.systems.forEach((system) => {
      system.update(this);
    });
  }
}
