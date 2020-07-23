import { actions, assign, send } from 'xstate';
import {
  GameHistory,
  VoteTeamOutcome,
  GameSocketEvents,
  MissionOutcome,
  Alliance,
} from '@proavalon/proto/game';
import { RoomContext, RoomEvents } from './rooms-machine-types';
import { addRoles } from '../ecs/game-assemblages';
import { CPlayer, CVoteTeam, CVoteMission } from '../ecs/game-components';
import { allSystems } from '../ecs/game-systems';
import {
  filterByComponent,
  indexOfPlayer,
  getPlayers,
  getLastProposalHistory,
  getCurrentTeamSize,
  getNumMissionOutcomes,
} from '../util';
import {
  voteTeamRejected,
  missionsFinished,
  voteTeamHammerRejected,
} from './room-machine-guards';

const { pure } = actions;

const NUM_SPIES: Record<number, number> = {
  5: 2,
  6: 2,
  7: 3,
  8: 3,
  9: 4,
  10: 4,
};

export const startGame = assign<RoomContext, RoomEvents>((c, _) => {
  // test
  const { entities } = c;
  const players = filterByComponent(entities, CPlayer.name).filter(
    (e) => (e.components[CPlayer.name] as CPlayer).satDown,
  );

  const gameSize = players.length;
  const leader = Math.floor(Math.random() * gameSize);

  let count = 0;

  // Set in resistance
  for (let i = 0; i < players.length - NUM_SPIES[players.length]; i += 1) {
    addRoles.Resistance(players[count]);
    count += 1;
  }

  // Set in spies
  for (let i = 0; i < NUM_SPIES[players.length]; i += 1) {
    addRoles.Spy(players[count]);
    count += 1;
  }

  // Give the last spy a special assassin role
  addRoles.Assassin(players[players.length - 1]);

  // Start the mission history
  const gameHistory: GameHistory = {
    missionHistory: [
      {
        fails: 0,
        proposals: [],
      },
    ],
    missionOutcome: [],
  };

  return {
    ...c,
    gameData: {
      ...c.gameData,
      leader,
      gameSize,
      gameHistory,
    },
    systems: [], // ['SAssassin'],
  };
});

export const finishGameEntry = assign<RoomContext, RoomEvents>((c, _) => {
  const { numSuccess, numFail } = getNumMissionOutcomes(c);
  const gameData = { ...c.gameData };

  if (numSuccess >= 3) {
    gameData.winner = Alliance.resistance;
  } else if (numFail >= 3) {
    gameData.winner = Alliance.spy;
  }

  return {
    ...c,
    gameData,
  };
});

export const runSystems = pure((c: RoomContext, e: RoomEvents) => {
  let actionsToExecute: any[] = [];
  const { systems } = c;

  for (const system of systems) {
    const res = allSystems[system].update(c, e);

    if (res) {
      actionsToExecute = actionsToExecute.concat(res);

      // Only allow one system to take action
      break;
    }
  }

  // Move out of game.standard.finished if there are no actions to execute
  if (actionsToExecute.length === 0 && c.gameState === 'standard.finished') {
    actionsToExecute.push(send({ type: 'gameFinishDone' }));
  }

  return actionsToExecute;
});

export const addSystem = assign<RoomContext, RoomEvents>((c, e) => {
  if (e.type === 'ADD_SYSTEM') {
    return {
      ...c,
      systems: [...c.systems, e.systemName],
    };
  }

  return {
    ...c,
  };
});

export const handleSpecialEvent = pure((c: RoomContext, e: RoomEvents) => {
  let actionsToExecute: any[] = [];
  const { systems } = c;

  for (const system of systems) {
    const res = allSystems[system].handleEvent(c, e);

    if (res) {
      actionsToExecute = actionsToExecute.concat(res);

      // Only allow one system to take action
      break;
    }
  }

  return actionsToExecute;
});

export const pickEvent = assign<RoomContext, RoomEvents>((c, e) => {
  if (e.type === 'PICK') {
    // Add on the proposal
    const gameHistory = { ...c.gameData.gameHistory };
    const leader = getPlayers(c.entities)[c.gameData.leader];
    const leaderUsername = (leader.components[CPlayer.name] as CPlayer)
      .displayUsername;

    gameHistory.missionHistory[
      gameHistory.missionHistory.length - 1
    ].proposals.push({
      team: e.data.team,
      votes: {},
      leaderUsername,
    });

    return {
      ...c,
      gameData: { ...c.gameData, team: e.data.team },
    };
  }

  return { ...c };
});

export const voteTeamEvent = assign<RoomContext, RoomEvents>((c, e) => {
  if (e.type === 'VOTE_TEAM' && e.data && e.data.vote) {
    const { entities } = c;

    const index = indexOfPlayer(entities, e.player.displayUsername);

    // voteTeamComp here is a reference and changes to it will change entities too.
    const voteTeamComp = entities[index].components[
      CVoteTeam.name
    ] as CVoteTeam;

    voteTeamComp.vote = e.data.vote;

    return {
      ...c,
      entities,
    };
  }

  return { ...c };
});

export const voteTeamFinish = assign<RoomContext, RoomEvents>((c, e) => {
  const entities = [...c.entities];
  const entitiesCanVote = filterByComponent(entities, CVoteTeam.name);
  const gameHistory = { ...c.gameData.gameHistory };

  let newLeader = c.gameData.leader;

  if (voteTeamHammerRejected(c, e)) {
    while (gameHistory.missionOutcome.length < 5) {
      gameHistory.missionOutcome.push(MissionOutcome.fail);
    }
  } else if (voteTeamRejected(c, e)) {
    // Increment the leader if team was rejected
    // If approved, voteMissionFinish will increment
    newLeader = (c.gameData.leader + 1) % entitiesCanVote.length;
  }

  // Save the votes
  const lastProposal = getLastProposalHistory(c);

  for (const voter of entitiesCanVote) {
    const playerComp = voter.components[CPlayer.name] as CPlayer;
    const voteComp = voter.components[CVoteTeam.name] as CVoteTeam;

    // Save their vote to gameHistory
    lastProposal.votes[
      playerComp.displayUsername
    ] = voteComp.vote as VoteTeamOutcome;

    // Reset vote to undefined
    voteComp.vote = undefined;
  }

  return {
    ...c,
    entities,
    gameData: {
      ...c.gameData,
      leader: newLeader,
      gameHistory,
    },
  };
});

export const voteMissionEvent = assign<RoomContext, RoomEvents>((c, e) => {
  if (e.type === GameSocketEvents.VOTE_MISSION && e.data && e.data.vote) {
    const entities = [...c.entities];
    const lastProposal = getLastProposalHistory(c);

    // Is the requester on the team and can vote?
    if (
      e.type === GameSocketEvents.VOTE_MISSION &&
      lastProposal.team.includes(e.player.displayUsername)
    ) {
      const index = indexOfPlayer(entities, e.player.displayUsername);
      // voteMissionComp here is a reference and changes to it will change entities too.
      const voteMissionComp = entities[index].components[
        CVoteMission.name
      ] as CVoteMission;

      voteMissionComp.vote = e.data.vote;
      return {
        ...c,
        entities,
      };
    }
  }

  return { ...c };
});

const getMissionVoteCounts = (c: RoomContext) => {
  // Get all entities that can vote
  const entities = [...c.entities];
  const entitiesCanVote = filterByComponent(entities, CVoteMission.name);

  // Get votes
  const votes = entitiesCanVote
    .map((e) => (e.components[CVoteMission.name] as CVoteMission).vote)
    .filter((vote) => vote);

  // Check that they all have a vote in
  if (votes.length !== getCurrentTeamSize(c)) {
    return false;
  }

  // Get the output of the vote
  const numSuccess = votes.filter((vote) => vote === MissionOutcome.success)
    .length;
  const numFails = votes.filter((vote) => vote === MissionOutcome.fail).length;

  return {
    numSuccess,
    numFails,
  };
};

export const voteMissionFinish = assign<RoomContext, RoomEvents>((c, e) => {
  const entities = [...c.entities];
  const entitiesCanVote = filterByComponent(entities, CVoteMission.name);
  const gameHistory = { ...c.gameData.gameHistory };
  const missionVoteCounts = getMissionVoteCounts(c);

  // TODO Add in the 8P+ requiring 2 fails for M4.

  // Mission failed
  if (missionVoteCounts && missionVoteCounts.numFails > 0) {
    // Set the num of fails into last mission in gameHistory
    gameHistory.missionHistory[gameHistory.missionHistory.length - 1].fails =
      missionVoteCounts.numFails;

    gameHistory.missionOutcome.push(MissionOutcome.fail);
  }
  // Mission succeeded
  else if (missionVoteCounts) {
    // Default value for fails is 0, so if success don't need to do anything
    gameHistory.missionOutcome.push(MissionOutcome.success);
  }

  if (!missionsFinished(c, e)) {
    // Add on the next VH if the game hasn't finished yet.
    gameHistory.missionHistory.push({
      fails: 0,
      proposals: [],
    });
  }

  for (const voter of entitiesCanVote) {
    const voteComp = voter.components[CVoteMission.name] as CVoteTeam;

    // Reset vote to undefined
    voteComp.vote = undefined;
  }

  // Increment the leader only if game hasn't finished
  const numOfPlayers = filterByComponent(entities, CPlayer.name).length;
  let newLeader = c.gameData.leader;

  if (!missionsFinished(c, e)) {
    newLeader = (newLeader + 1) % numOfPlayers;
  }

  return {
    ...c,
    entities,
    gameData: {
      ...c.gameData,
      leader: newLeader,
    },
  };
});
