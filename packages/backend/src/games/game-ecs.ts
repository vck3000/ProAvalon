/* eslint-disable max-classes-per-file */
/*
   Ideas for the ECS

   Each entity is made up of a number of different components.

   A component is a feature, such as a colour, a position, an ability, etc.


   Each role that we have in The Resistance has an alliance, an ability to vote
   on teams, an ability to vote on missions, can use action cards, have a unique
   displayUsername they are tied with, a role name.
*/

import { Logger } from '@nestjs/common';
import { Entity } from './game-entity';
import { Resistance, Spy, Merlin, Assassin } from './game-assemblages';

export default class GameECS {
  count: number;
  entities: Entity[];

  constructor() {
    this.count = 0;

    this.entities = [];

    // Some initial testing code;
  }

  createEntity() {
    // Create a new entity, push to entities, and then return the new entity.
    this.count += 1;
    this.entities.push(new Entity(this.count));
    return this.entities[this.entities.length - 1];
  }
}

setTimeout(() => {
  const game = new GameECS();

  // Apply on some roles
  Resistance(game);
  Spy(game);
  Merlin(game);
  Assassin(game);
  const logger = new Logger('GameECS');

  logger.log(game.entities);
}, 500);
