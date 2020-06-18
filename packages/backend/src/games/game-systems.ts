import GameECS from './game-ecs';
import {
  VoteTeam,
  CVoteTeam,
  CPlayer,
} from './game-components';
import { SocketUser } from '../users/users.socket';

const SystemVoteTeamCalc = (game: GameECS) => {
  // Get all entities that can vote
  const entitiesCanVote = game.entities.filter(
    (entity) => entity.components.voteTeam,
  );

  // Count votes
  const votes: VoteTeam[] = [];
  for (const entity of entitiesCanVote) {
    // Only push on valid votes
    if (entity.components.voteTeam) {
      votes.push((entity.components.voteTeam as CVoteTeam).voteTeam);
    }
  }

  // Check that they all have a vote in
  if (votes.length !== entitiesCanVote.length) {
    return;
  }

  // Get the output of the vote
  const numFails = votes.filter((vote) => vote === 'reject').length;

  if (numFails > 0) {
    console.log(`We have ${numFails} fails!`);
  } else {
    console.log('There were no fails');
  }
};

export const SystemVoteTeam = (
  game: GameECS,
  socket: SocketUser,
  vote: VoteTeam,
) => {
  // TODO: Check valid vote

  let entityFound = false;
  // locate entity with socketId
  for (const entity of game.entities) {
    // Entity must be able to vote and have a matching socket id
    if (
      entity.components.voteTeam &&
      entity.components.player &&
      (entity.components.player as CPlayer).socketId === socket.id
    ) {
      // Apply vote
      (entity.components.voteTeam as CVoteTeam).voteTeam = vote;

      entityFound = true;
      break;
    }
  }

  // Check whether all votes are in
  if (entityFound) {
    SystemVoteTeamCalc(game);
  }
};
