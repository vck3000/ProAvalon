/* eslint-disable max-classes-per-file */

// import { GameEventVoteTeam } from '@proavalon/proto/game';
// import { transformAndValidate } from '@proavalon/proto';
import { send, assign } from 'xstate';
import {
  VoteTeam,
  CVoteTeam,
  VoteMission,
  CVoteMission,
  CAssassin,
  CPlayer,
} from './game-components';
import { RoomContext, RoomEvents } from '../room/room-machine';
import { filterByComponent } from '../util';
import { setGameStateFactory } from '../room/room-machine-actions';
import { Entity } from './game-entity';

export abstract class System {
  priority = 0;
  abstract update(c: RoomContext, e: RoomEvents): any;
  abstract handleEvent(c: RoomContext, e: RoomEvents): any;
}

export class SVoteTeam implements System {
  priority = 0;

  update = (c: RoomContext, _: RoomEvents) => {
    // Get all entities that can vote
    const entitiesCanVote = filterByComponent(c.entities, CVoteTeam.name);

    // Count votes
    const votes: VoteTeam[] = [];
    for (const entity of entitiesCanVote) {
      // Only push on valid votes
      if (
        entity.components.voteTeam &&
        (entity.components.voteTeam as CVoteTeam).vote
      ) {
        votes.push((entity.components.voteTeam as CVoteTeam).vote);
      }
    }

    // Check that they all have a vote in
    if (votes.length !== entitiesCanVote.length) {
      return;
    }

    // Get the output of the vote
    const numApproves = votes.filter((vote) => vote === 'approve').length;
    const numRejects = votes.filter((vote) => vote === 'reject').length;

    if (numApproves > numRejects) {
      // TODO: Log this
    } else {
      // TODO: Log this
    }

    // TODO: Reset everyone's votes back to undefined
  };

  handleEvent = () => undefined;
}

export class SVoteMission implements System {
  priority = 0;

  update = (c: RoomContext, _: RoomEvents) => {
    // Get all entities that can vote
    const entitiesCanVote = filterByComponent(c.entities, CVoteMission.name);

    // Count votes
    const votes: VoteMission[] = [];
    for (const entity of entitiesCanVote) {
      // Only push on valid votes
      if (entity.components.voteMission) {
        votes.push((entity.components.voteMission as CVoteMission).vote);
      }
    }

    // Check that they all have a vote in
    if (votes.length !== entitiesCanVote.length) {
      return;
    }

    // Get the output of the vote
    const numFails = votes.filter((vote) => vote === 'fail').length;

    if (numFails > 0) {
      // TODO: Log this
    } else {
      // TODO: Log this
    }

    // TODO: Reset everyone's votes back to undefined
  };

  handleEvent = () => undefined;
}

// export const EventVoteTeam = async (
//   game: GameECS,
//   socket: SocketUser,
//   dataNotValidated: any,
// ) => {
//   const data = await transformAndValidate(
//     GameEventVoteTeam,
//     dataNotValidated as GameEventVoteTeam,
//   );
//
//   let entityFound = false;
//
//   // locate entity with socketId
//   for (const entity of game.entities) {
//     // Entity must be able to vote and have a matching socket id
//     if (
//       entity.components.voteTeam &&
//       entity.components.player &&
//       (entity.components.player as CPlayer).displayUsername ===
//         socket.user.displayUsername
//     ) {
//       // Apply vote
//       (entity.components.voteTeam as CVoteTeam).vote = data.vote;
//
//       entityFound = true;
//
//       break;
//     }
//   }
//
//   if (!entityFound) {
//     // TODO: Make this a logger
//   }
// };

export class SAssassin implements System {
  priority = 0;

  // Enter the assassin state if time is right.
  update = (c: RoomContext, _: RoomEvents) => {
    const { entities } = c;

    // Do we have an assassin that is active right now?
    let index = this.getFirstActiveAssassinIndex(entities);

    // Run assassination if user has given the event
    if (index !== -1) {
      // Check the first active assassin:
      const { target } = entities[index].components.CAssassin as CAssassin;
      if (target) {
        return send('SPECIAL_STATE_LEAVE');
      }
    }

    // Otherwise, check to see if we can enter
    if (c.gameState === 'voteTeam') {
      // Find an assassin that hasn't finished yet.
      index = this.getFirstNonFinishedAssassinIndex(entities);

      if (index !== -1) {
        (entities[index].components.CAssassin as CAssassin).active = true;
        return [setGameStateFactory('SAssassin'), send('SPECIAL_STATE_ENTER')];
      }
    }
    return undefined;
  };

  getFirstNonFinishedAssassinIndex = (entities: Entity[]) => {
    for (const [i, entity] of entities.entries()) {
      if (
        entity.components[CAssassin.name] &&
        !(entity.components[CAssassin.name] as CAssassin).finished
      ) {
        return i;
      }
    }
    return -1;
  };

  getFirstActiveAssassinIndex = (entities: Entity[]) => {
    for (const [i, entity] of entities.entries()) {
      if (
        entity.components[CAssassin.name] &&
        (entity.components[CAssassin.name] as CAssassin).active
      ) {
        return i;
      }
    }
    return -1;
  };

  // Return a list of actions to make. Return undefined if not applicable.
  handleEvent = (c: RoomContext, e: RoomEvents) => {
    if (e.type === 'SPECIAL' && e.specialType === SAssassin.name) {
      const { entities } = c;

      // Take the first active assassin
      const index = this.getFirstActiveAssassinIndex(entities);

      if (index !== -1) {
        // Check that we received this event from the right person.
        if (
          e.player.displayUsername !==
          (entities[index].components[CPlayer.name] as CPlayer).displayUsername
        ) {
          // Log a warning here - if this possibly happens then we have
          // multiple active assassins
          return undefined;
        }

        // Set in the target shot
        (entities[index].components[CAssassin.name] as CAssassin).target =
          e.data.target;

        // Store in the new data
        return assign<RoomContext, RoomEvents>((cc, _) => ({
          ...cc,
          entities,
        }));
      }
    }

    return undefined;
  };
}

export const allSystems = {
  [SVoteTeam.name]: new SVoteTeam(),
  [SVoteMission.name]: new SVoteMission(),
  [SAssassin.name]: new SAssassin(),
};
