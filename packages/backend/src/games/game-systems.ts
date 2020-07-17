/* eslint-disable max-classes-per-file */

import { GameEventVoteTeam } from '@proavalon/proto/game';
import { transformAndValidate } from '@proavalon/proto';
import GameECS from './game-ecs';
import {
  VoteTeam,
  CVoteTeam,
  CPlayer,
  VoteMission,
  CVoteMission,
} from './game-components';
import { SocketUser } from '../users/users.socket';

export abstract class System {
  priority = 0;
  abstract update(game: GameECS): void;
}

export class SVoteTeam extends System {
  update = (game: GameECS) => {
    // Get all entities that can vote
    const entitiesCanVote = game.entities.filter(
      (entity) => entity.components.voteTeam,
    );

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
}

export class SVoteMission extends System {
  update = (game: GameECS) => {
    // Get all entities that can vote
    const entitiesCanVote = game.entities.filter(
      (entity) => entity.components.voteMission,
    );

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
}

export const EventVoteTeam = async (
  game: GameECS,
  socket: SocketUser,
  dataNotValidated: any,
) => {
  const data = await transformAndValidate(
    GameEventVoteTeam,
    dataNotValidated as GameEventVoteTeam,
  );

  let entityFound = false;

  // locate entity with socketId
  for (const entity of game.entities) {
    // Entity must be able to vote and have a matching socket id
    if (
      entity.components.voteTeam &&
      entity.components.player &&
      (entity.components.player as CPlayer).displayUsername ===
        socket.user.displayUsername
    ) {
      // Apply vote
      (entity.components.voteTeam as CVoteTeam).vote = data.vote;

      entityFound = true;

      break;
    }
  }

  if (!entityFound) {
    // TODO: Make this a logger
  }
};
