import { RoomContext, RoomEvents } from './room-machine';
import { indexOfPlayer, filterByComponent } from '../util';
import { CPlayer, CVoteTeam } from '../ecs/game-components';

export const isLeaderCond = (c: RoomContext, e: RoomEvents) => {
  if (e.type === 'PICK') {
    const index = indexOfPlayer(c.entities, e.player.displayUsername);

    return index === c.gameData.leader;
  }
  return false;
};

export const minPlayers = (c: RoomContext, _: RoomEvents) => {
  const players = filterByComponent(c.entities, CPlayer.name);

  const satPlayers = players.filter(
    (player) => (player.components[CPlayer.name] as CPlayer).satDown,
  );

  return satPlayers.length >= 5;
};

// Return false (so that the functions that use it can be predicate)
// if not all votes are in yet.
export const getAllTeamVotes = (c: RoomContext) => {
  // Get all entities that can vote
  const { entities } = c;
  const entitiesCanVote = filterByComponent(entities, CVoteTeam.name);

  // console.log(entitiesCanVote);

  // Get votes
  const votes = entitiesCanVote
    .map((e) => (e.components[CVoteTeam.name] as CVoteTeam).vote)
    .filter((vote) => vote);

  // Check that they all have a vote in
  if (votes.length !== entitiesCanVote.length) {
    return false;
  }

  // Get the output of the vote
  const numApproves = votes.filter((vote) => vote === 'approve').length;
  const numRejects = votes.filter((vote) => vote === 'reject').length;

  return {
    numApproves,
    numRejects,
  };
};

export const voteTeamRejected = (c: RoomContext, _: RoomEvents) => {
  const votes = getAllTeamVotes(c);
  return votes && votes.numRejects >= votes.numApproves;
};

// TODO Later add in an extra check that it's the hammer pick.
export const voteTeamHammerRejected = (_: RoomContext, __: RoomEvents) => false;
// const rejected = voteTeamRejected(c, _);
//   return false;
// };

export const voteTeamApproved = (c: RoomContext, _: RoomEvents) => {
  const votes = getAllTeamVotes(c);
  return votes && !(votes.numRejects >= votes.numApproves);
};
