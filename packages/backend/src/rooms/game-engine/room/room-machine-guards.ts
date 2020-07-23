import { GameSocketEvents } from '@proavalon/proto/game';
import { RoomContext, RoomEvents } from './rooms-machine-types';
import {
  indexOfPlayer,
  filterByComponent,
  getPlayers,
  getCurrentTeamSize,
  getNumMissionOutcomes,
} from '../util';
import { CPlayer, CVoteTeam, CVoteMission } from '../ecs/game-components';

export const pickTeamGuard = (c: RoomContext, e: RoomEvents) => {
  if (e.type === GameSocketEvents.PICK && e.data && e.data.team) {
    // Check for team leader
    const index = indexOfPlayer(c.entities, e.player.displayUsername);
    if (index !== c.gameData.leader) {
      return false;
    }

    const teamSize = getCurrentTeamSize(c);
    // Check for correct team size given
    if (teamSize !== e.data.team.length) {
      return false;
    }

    // Check for good displayUsernames given
    const players = getPlayers(c.entities);
    const playerDisplayUsernames = players.map((en) =>
      (en.components[CPlayer.name] as CPlayer).displayUsername.toLowerCase(),
    );

    for (const displayUsername of e.data.team) {
      if (!playerDisplayUsernames.includes(displayUsername.toLowerCase())) {
        return false;
      }
    }

    return true;
  }
  return false;
};

export const minPlayers = (c: RoomContext, _: RoomEvents) => {
  const players = filterByComponent(c.entities, CPlayer.name).filter(
    (e) => (e.components[CPlayer.name] as CPlayer).satDown,
  );

  return players.length >= 5;
};

export const getAllTeamVotes = (c: RoomContext) => {
  // Get all entities that can vote
  const entities = [...c.entities];
  const entitiesCanVote = filterByComponent(entities, CVoteTeam.name);

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

export const voteTeamHammerRejected = (c: RoomContext, e: RoomEvents) => {
  const rejected = voteTeamRejected(c, e);
  const { missionHistory } = c.gameData.gameHistory;

  if (missionHistory.length > 0) {
    const pickNum = missionHistory[missionHistory.length - 1].proposals.length;

    return rejected && pickNum === 5;
  }
  return false;
};

export const voteTeamApproved = (c: RoomContext, _: RoomEvents) => {
  const votes = getAllTeamVotes(c);
  return votes && !(votes.numRejects >= votes.numApproves);
};

// --------------------------------

export const allMissionVotesIn = (c: RoomContext, _: RoomEvents) => {
  // Get all entities that can vote
  const entities = [...c.entities];
  const entitiesCanVote = filterByComponent(entities, CVoteMission.name);
  // Get votes
  const votes = entitiesCanVote
    .map((e) => (e.components[CVoteMission.name] as CVoteMission).vote)
    .filter((vote) => vote);

  return votes.length === getCurrentTeamSize(c);
};

// Game over if we have 3 successes or 3 fails
export const missionsFinished = (c: RoomContext, _: RoomEvents) => {
  const { numSuccess, numFail } = getNumMissionOutcomes(c);
  return numSuccess >= 3 || numFail >= 3;
};
