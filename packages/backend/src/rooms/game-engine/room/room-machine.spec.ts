import { interpret, Interpreter } from 'xstate';
import { RoomSocketEvents } from '@proavalon/proto/room';
import {
  GameState,
  GameSocketEvents,
  VoteTeamOutcome,
  MissionOutcome,
} from '@proavalon/proto/game';
import { RoomMachine } from './room-machine';
import {
  RoomContext,
  RoomStateSchema,
  RoomEvents,
} from './rooms-machine-types';
import { CPlayer, CVoteTeam, CVoteMission } from '../ecs/game-components';
import { SAssassin } from '../ecs/game-systems';
import { getAllTeamVotes } from './room-machine-guards';
import { filterByComponent } from '../util';

function* mockPlayerGen() {
  let socketId = 1;
  let username = 'a';
  let displayUsername = username.toUpperCase();

  while (true) {
    yield {
      socketId: socketId.toString(),
      displayUsername,
    };
    socketId += 1;
    username = String.fromCharCode(username.charCodeAt(0) + 1);
    displayUsername = username.toUpperCase();
  }
}

describe('RoomMachine [Base]', () => {
  let service: Interpreter<RoomContext, RoomStateSchema, RoomEvents, any>;
  let gen: ReturnType<typeof mockPlayerGen>;

  beforeEach(() => {
    service = interpret(RoomMachine).start();
    gen = mockPlayerGen();
  });

  it('should be able to let a user join, sit down, stand up, and leave correctly', () => {
    const player = gen.next().value;

    expect(service.state.context.entities.length).toEqual(0);

    service.send(RoomSocketEvents.JOIN_ROOM, { player });
    expect(service.state.context.entities[0].components).toHaveProperty(
      CPlayer.name,
    );
    expect(service.state.context.entities[0].components[CPlayer.name]).toEqual(
      expect.objectContaining({ ...player, satDown: false }),
    );

    service.send(RoomSocketEvents.SIT_DOWN, { player });
    expect(service.state.context.entities[0].components[CPlayer.name]).toEqual(
      expect.objectContaining({ ...player, satDown: true }),
    );

    service.send(RoomSocketEvents.STAND_UP, { player });
    expect(service.state.context.entities[0].components[CPlayer.name]).toEqual(
      expect.objectContaining({ ...player, satDown: false }),
    );

    service.send(RoomSocketEvents.LEAVE_ROOM, { player });
    expect(service.state.context.entities.length).toEqual(0);
  });

  it('should be able to let a user leave while sat down', () => {
    const player = gen.next().value;

    service.send(RoomSocketEvents.JOIN_ROOM, { player });
    service.send(RoomSocketEvents.SIT_DOWN, { player });

    expect(service.state.context.entities.length).toEqual(1);

    service.send(RoomSocketEvents.LEAVE_ROOM, { player });
    expect(service.state.context.entities.length).toEqual(0);
  });

  it('should only start game if there are at least 5 players sitting down', () => {
    // Only add 4 players
    for (let i = 0; i < 4; i += 1) {
      const player = gen.next().value;
      service.send(RoomSocketEvents.JOIN_ROOM, { player });
      service.send(RoomSocketEvents.SIT_DOWN, { player });
    }

    // Should not start
    service.send(RoomSocketEvents.START_GAME);
    expect(service.state.value).toEqual('waiting');

    // Join the 5th player
    const player = gen.next().value;
    service.send(RoomSocketEvents.JOIN_ROOM, { player });

    // Should not start if player hasn't sat down
    service.send(RoomSocketEvents.START_GAME);
    expect(service.state.value).toEqual('waiting');

    // Should start now
    service.send(RoomSocketEvents.SIT_DOWN, { player });

    service.send(RoomSocketEvents.START_GAME);
    expect(service.state.value).toEqual({
      game: { standard: 'pick', special: 'idle' },
    });
  });

  it('should not allow duplicate users', () => {
    const player = gen.next().value;

    service.send(RoomSocketEvents.JOIN_ROOM, { player });
    service.send(RoomSocketEvents.JOIN_ROOM, { player });

    expect(service.state.context.entities.length).toEqual(1);
  });
});

describe('RoomMachine [Game]', () => {
  let service: Interpreter<RoomContext, RoomStateSchema, RoomEvents, any>;
  let mockPlayers: any[];

  beforeEach(() => {
    service = interpret(RoomMachine).start();

    const gen = mockPlayerGen();
    mockPlayers = [];

    // Set up 6 player game and start it
    for (let i = 0; i < 6; i += 1) {
      const player = gen.next().value;
      mockPlayers.push(player);
      service.send(RoomSocketEvents.JOIN_ROOM, { player });
      service.send(RoomSocketEvents.SIT_DOWN, { player });
    }

    service.send(RoomSocketEvents.START_GAME);
  });

  it('should be able to pick, vote and approve team', () => {
    expect(service.state.value).toMatchObject({ game: { standard: 'pick' } });
    const { leader } = service.state.context.gameData;

    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['C', 'D'] },
    });
    expect(service.state.value).toMatchObject({
      game: {
        standard: 'voteTeam',
      },
    });

    // Give 4 approves, and 1 reject (one last vote missing)
    for (let i = 0; i < 5; i += 1) {
      if (i < 4) {
        service.send(GameSocketEvents.VOTE_TEAM, {
          player: mockPlayers[i],
          data: {
            vote: 'approve',
          },
        });
      } else {
        service.send(GameSocketEvents.VOTE_TEAM, {
          player: mockPlayers[i],
          data: {
            vote: 'reject',
          },
        });
      }
    }

    // Expect same state as we are waiting for last vote
    expect(service.state.value).toMatchObject({
      game: {
        standard: 'voteTeam',
      },
    });

    // Give in the last vote
    service.send(GameSocketEvents.VOTE_TEAM, {
      player: mockPlayers[5],
      data: {
        vote: 'reject',
      },
    });

    // Should be voting on the mission now.
    expect(service.state.value).toMatchObject({
      game: {
        standard: 'voteMission',
      },
    });

    // Leader should not advance yet until mission is voted on.
    expect(service.state.context.gameData.leader).toEqual(leader);

    // Should reset the votes - can remove this later if needed.
    expect(getAllTeamVotes(service.state.context)).toEqual(false);
  });

  it('should be able to pick, vote and reject team', () => {
    expect(service.state.value).toMatchObject({ game: { standard: 'pick' } });
    const { leader } = service.state.context.gameData;

    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['C', 'D'] },
    });
    expect(service.state.value).toMatchObject({
      game: {
        standard: 'voteTeam',
      },
    });

    // Give 3 approves, team should be rejected
    for (let i = 0; i < 6; i += 1) {
      if (i < 3) {
        service.send(GameSocketEvents.VOTE_TEAM, {
          player: mockPlayers[i],
          data: {
            vote: 'approve',
          },
        });
      } else {
        service.send(GameSocketEvents.VOTE_TEAM, {
          player: mockPlayers[i],
          data: {
            vote: 'reject',
          },
        });
      }
    }

    // Should be voting on the mission now.
    expect(service.state.value).toMatchObject({
      game: { standard: 'pick' },
    });

    // Leader should advance.
    expect(service.state.context.gameData.leader).toEqual(
      (leader + 1) % (mockPlayers.length - 1),
    );

    // Should reset the votes - can remove this later if needed.
    expect(getAllTeamVotes(service.state.context)).toEqual(false);
  });

  it('should only pick if requester is leader', () => {
    expect(service.state.value).toMatchObject({ game: { standard: 'pick' } });

    const { leader } = service.state.context.gameData;

    // Send from wrong leader
    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[(leader + 1) % (mockPlayers.length - 1)],
      data: { team: ['C', 'D'] },
    });
    expect(service.state.value).toMatchObject({
      game: {
        standard: 'pick',
      },
    });

    // Send from correct leader
    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['C', 'D'] },
    });
    expect(service.state.value).toMatchObject({
      game: {
        standard: 'voteTeam',
      },
    });

    // Expect no change for PICK event in a VOTE state
    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['C', 'D'] },
    });
    expect(service.state.value).toMatchObject({
      game: {
        standard: 'voteTeam',
      },
    });
  });

  it('should not be able to transition standard states in special state', () => {
    const { leader } = service.state.context.gameData;
    // Starting state
    expect(service.state.value).toEqual({
      game: { standard: 'pick', special: 'idle' },
    });

    service.send('SPECIAL_STATE_ENTER');

    // Enter special state
    expect(service.state.value).toEqual({
      game: { standard: 'pick', special: 'active' },
    });

    // Should not transition in standard states
    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['C', 'D'] },
    });
    expect(service.state.value).toEqual({
      game: { standard: 'pick', special: 'active' },
    });

    // Leave special state
    service.send('SPECIAL_STATE_LEAVE');
    expect(service.state.value).toEqual({
      game: { standard: 'pick', special: 'idle' },
    });

    // Enter voteTeam state
    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['C', 'D'] },
    });
    expect(service.state.value).toEqual({
      game: { standard: 'voteTeam', special: 'idle' },
    });

    // Enter special state
    service.send('SPECIAL_STATE_ENTER');
    service.send(GameSocketEvents.VOTE_TEAM);

    // Should be unable to transition out of voteTeam
    expect(service.state.value).toEqual({
      game: { standard: 'voteTeam', special: 'active' },
    });
  });

  it('should not allow an incorrect team size to be picked', () => {
    expect(service.state.value).toMatchObject({ game: { standard: 'pick' } });

    // Leader make a pick
    const { leader } = service.state.context.gameData;

    // Too few picks
    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['C'] },
    });

    expect(service.state.value).toMatchObject({
      game: { standard: GameState.pick },
    });

    // No picks
    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
    });

    expect(service.state.value).toMatchObject({
      game: { standard: GameState.pick },
    });

    // Too many picks
    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['C', 'D', 'E'] },
    });

    expect(service.state.value).toMatchObject({
      game: { standard: GameState.pick },
    });

    // Bad username, right number of people picked
    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['C', 'O'] },
    });

    expect(service.state.value).toMatchObject({
      game: { standard: GameState.pick },
    });

    // Good pick request
    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['a', 'B'] },
    });

    expect(service.state.value).toMatchObject({
      game: { standard: GameState.voteTeam },
    });
  });

  it('should be able to pick and voteTeam, and also record gameHistory correctly', () => {
    expect(service.state.value).toMatchObject({ game: { standard: 'pick' } });

    // Leader make a pick
    let { leader } = service.state.context.gameData;

    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['C', 'D'] },
    });

    // Expect gameHistory to have updated
    let { missionHistory } = service.state.context.gameData.gameHistory;
    expect(missionHistory.length).toEqual(1);
    expect(missionHistory[0].proposals.length).toEqual(1);
    expect(missionHistory[0].proposals[0].team).toEqual(['C', 'D']);
    expect(missionHistory[0].proposals[0].leaderUsername).toEqual(
      mockPlayers[leader].displayUsername,
    );
    expect(Object.keys(missionHistory[0].proposals[0].votes).length).toEqual(0);

    expect(service.state.value).toMatchObject({
      game: { standard: 'voteTeam' },
    });

    // Reject first proposal - only give first 5 votes
    for (let i = 0; i < 2; i += 1) {
      service.send(GameSocketEvents.VOTE_TEAM, {
        player: mockPlayers[i],
        data: {
          vote: VoteTeamOutcome.approve,
        },
      });
    }

    for (let i = 2; i < 5; i += 1) {
      service.send(GameSocketEvents.VOTE_TEAM, {
        player: mockPlayers[i],
        data: {
          vote: VoteTeamOutcome.reject,
        },
      });
    }

    // Should still be in voteTeam state
    expect(service.state.value).toMatchObject({
      game: { standard: 'voteTeam' },
    });

    // Should not leak votes prematurely
    expect(Object.keys(missionHistory[0].proposals[0].votes).length).toEqual(0);

    // Send in final vote
    service.send(GameSocketEvents.VOTE_TEAM, {
      player: mockPlayers[5],
      data: {
        vote: VoteTeamOutcome.reject,
      },
    });

    expect(service.state.value).toMatchObject({
      game: { standard: GameState.pick },
    });

    expect(missionHistory[0].proposals[0].votes).toEqual({
      A: VoteTeamOutcome.approve,
      B: VoteTeamOutcome.approve,
      C: VoteTeamOutcome.reject,
      D: VoteTeamOutcome.reject,
      E: VoteTeamOutcome.reject,
      F: VoteTeamOutcome.reject,
    });

    // Votes should be reset
    const votes = filterByComponent(
      service.state.context.entities,
      CVoteTeam.name,
    ).map((e) => e.components[CVoteTeam.name] as CVoteTeam);

    for (const vote of votes) {
      expect(vote.vote).toBeUndefined();
    }

    // Increase the leader
    leader = (leader + 1) % 5;

    // Make second pick
    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['A', 'B'] },
    });

    expect(service.state.value).toMatchObject({
      game: { standard: GameState.voteTeam },
    });

    // Expect the next gameHistory data to come in.
    missionHistory = service.state.context.gameData.gameHistory.missionHistory;
    expect(missionHistory.length).toEqual(1);
    expect(missionHistory[0].proposals.length).toEqual(2);
    expect(missionHistory[0].proposals[1].team).toEqual(['A', 'B']);
    expect(missionHistory[0].proposals[1].leaderUsername).toEqual(
      mockPlayers[leader].displayUsername,
    );
    expect(Object.keys(missionHistory[0].proposals[1].votes).length).toEqual(0);

    // Approve the team
    for (let i = 0; i < 4; i += 1) {
      service.send(GameSocketEvents.VOTE_TEAM, {
        player: mockPlayers[i],
        data: {
          vote: VoteTeamOutcome.approve,
        },
      });
    }

    for (let i = 4; i < 6; i += 1) {
      service.send(GameSocketEvents.VOTE_TEAM, {
        player: mockPlayers[i],
        data: {
          vote: VoteTeamOutcome.reject,
        },
      });
    }

    expect(service.state.value).toMatchObject({
      game: { standard: GameState.voteMission },
    });

    expect(missionHistory[0].proposals[1].votes).toEqual({
      A: VoteTeamOutcome.approve,
      B: VoteTeamOutcome.approve,
      C: VoteTeamOutcome.approve,
      D: VoteTeamOutcome.approve,
      E: VoteTeamOutcome.reject,
      F: VoteTeamOutcome.reject,
    });

    // Leader shouldn't increment yet as we're in voting mission now
    expect(service.state.context.gameData.leader).toEqual(leader);
  });

  it('should only let players on the team vote on the missionOutcome', () => {
    expect(service.state.value).toMatchObject({
      game: { standard: GameState.pick },
    });

    // Leader make a pick
    const { leader } = service.state.context.gameData;

    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['A', 'B'] },
    });

    expect(service.state.value).toMatchObject({
      game: { standard: GameState.voteTeam },
    });

    // All approve the proposed team
    for (const player of mockPlayers) {
      service.send(GameSocketEvents.VOTE_TEAM, {
        player,
        data: {
          vote: VoteTeamOutcome.approve,
        },
      });
    }

    expect(service.state.value).toMatchObject({
      game: { standard: GameState.voteMission },
    });

    // Only accept mission votes from players on the team
    // Send out C, D, E, F (not on the team)
    for (let i = 2; i < 6; i += 1) {
      service.send(GameSocketEvents.VOTE_MISSION, {
        player: mockPlayers[i],
        data: {
          vote: MissionOutcome.success,
        },
      });

      // Bit of a strict test, but the missionVotes shouldn't be stored
      // for those not on the mission
      const entity = service.state.context.entities[i];
      expect(
        (entity.components[CVoteMission.name] as CVoteMission).vote,
      ).toBeUndefined();
    }

    // Should not have progressed states
    expect(service.state.value).toMatchObject({
      game: { standard: GameState.voteMission },
    });
  });

  it('should be able to succeed and fail missions', () => {
    expect(service.state.value).toMatchObject({
      game: { standard: GameState.pick },
    });

    // Leader make a pick
    let { leader } = service.state.context.gameData;

    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['A', 'B'] },
    });

    expect(service.state.value).toMatchObject({
      game: { standard: GameState.voteTeam },
    });

    // All approve the proposed team
    for (const player of mockPlayers) {
      service.send(GameSocketEvents.VOTE_TEAM, {
        player,
        data: {
          vote: VoteTeamOutcome.approve,
        },
      });
    }

    expect(service.state.value).toMatchObject({
      game: { standard: GameState.voteMission },
    });

    // Leader shouldn't progress just yet
    expect(service.state.context.gameData.leader).toEqual(leader);

    // Test a successful mission for M1
    // Send in votes from players on team
    for (let i = 0; i < 2; i += 1) {
      service.send(GameSocketEvents.VOTE_MISSION, {
        player: mockPlayers[i],
        data: {
          vote: MissionOutcome.success,
        },
      });
    }

    // Leader should progress now
    leader = (leader + 1) % 5;
    expect(service.state.context.gameData.leader).toEqual(leader);

    expect(service.state.value).toMatchObject({
      game: { standard: GameState.pick },
    });

    expect(service.state.context.gameData.gameHistory.missionOutcome).toEqual([
      MissionOutcome.success,
    ]);

    // Test a failing mission for M2
    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['D', 'E', 'F'] },
    });

    expect(service.state.value).toMatchObject({
      game: { standard: GameState.voteTeam },
    });

    // All approve the proposed team
    for (const player of mockPlayers) {
      service.send(GameSocketEvents.VOTE_TEAM, {
        player,
        data: {
          vote: VoteTeamOutcome.approve,
        },
      });
    }

    // Leader shouldn't progress
    expect(service.state.context.gameData.leader).toEqual(leader);

    // Send in one fail
    service.send(GameSocketEvents.VOTE_MISSION, {
      player: mockPlayers[3],
      data: {
        vote: MissionOutcome.fail,
      },
    });
    service.send(GameSocketEvents.VOTE_MISSION, {
      player: mockPlayers[4],
      data: {
        vote: MissionOutcome.success,
      },
    });
    service.send(GameSocketEvents.VOTE_MISSION, {
      player: mockPlayers[5],
      data: {
        vote: MissionOutcome.success,
      },
    });

    // Leader should progress now
    leader = (leader + 1) % 5;
    expect(service.state.context.gameData.leader).toEqual(leader);

    expect(
      service.state.context.gameData.gameHistory.missionOutcome.length,
    ).toEqual(2);

    expect(service.state.context.gameData.gameHistory.missionOutcome).toEqual([
      MissionOutcome.success,
      MissionOutcome.fail,
    ]);

    // Should be back in pick state
    expect(service.state.value).toMatchObject({
      game: { standard: GameState.pick },
    });
  });

  it('should finish game on hammer reject and record gameHistory', () => {
    expect(service.state.value).toMatchObject({ game: { standard: 'pick' } });

    // Leader make a pick
    let { leader } = service.state.context.gameData;

    // Reject a team 5 times
    for (let i = 0; i < 5; i += 1) {
      // Send out a pick
      service.send(GameSocketEvents.PICK, {
        player: mockPlayers[leader],
        data: { team: ['C', 'D'] },
      });

      leader = (leader + 1) % 5;

      // Approve half, reject half. Edge case should reject team.
      for (let j = 0; j < 3; j += 1) {
        service.send(GameSocketEvents.VOTE_TEAM, {
          player: mockPlayers[j],
          data: {
            vote: VoteTeamOutcome.approve,
          },
        });
      }

      for (let j = 3; j < 6; j += 1) {
        service.send(GameSocketEvents.VOTE_TEAM, {
          player: mockPlayers[j],
          data: {
            vote: VoteTeamOutcome.reject,
          },
        });
      }
    }

    // Hammer reject should result in all fails
    expect(
      service.state.context.gameData.gameHistory.missionOutcome.length,
    ).toEqual(5);

    for (const outcome of service.state.context.gameData.gameHistory
      .missionOutcome) {
      expect(outcome).toEqual(MissionOutcome.fail);
    }

    expect(
      service.state.context.gameData.gameHistory.missionHistory[0].proposals
        .length,
    ).toEqual(5);

    // Should only be one mission recorded in gameHistory
    expect(
      service.state.context.gameData.gameHistory.missionHistory.length,
    ).toEqual(1);
  });

  // TODO This needs to be updated later for proper assassination system
  it('should go into and out of a special state correctly', () => {
    expect(service.state.value).toMatchObject({ game: { standard: 'pick' } });
    service.send('ADD_SYSTEM', { systemName: SAssassin.name });

    // Leader make a pick
    const { leader } = service.state.context.gameData;

    service.send(GameSocketEvents.PICK, {
      player: mockPlayers[leader],
      data: { team: ['C', 'D'] },
    });

    // TODO: Fix this later when assassination system is updated
    // Expect to be in assassin state now
    expect(service.state.value).toEqual({
      game: {
        standard: 'voteTeam',
        special: 'active',
      },
    });

    // Expect not to be able to do standard transition
    service.send(GameSocketEvents.VOTE_TEAM);
    expect(service.state.value).toEqual({
      game: {
        standard: 'voteTeam',
        special: 'active',
      },
    });

    // assassinate from the wrong player
    service.send('SPECIAL', {
      player: mockPlayers[0],
      data: { target: 'B' },
      specialType: SAssassin.name,
    });

    expect(service.state.value).toEqual({
      game: {
        standard: 'voteTeam',
        special: 'active',
      },
    });

    service.send('SPECIAL', {
      // assassinate from the right player (assassin)
      player: mockPlayers[5],
      data: { target: 'B' },
      specialType: SAssassin.name,
    });

    expect(service.state.value).toEqual({
      game: {
        standard: 'voteTeam',
        special: 'idle',
      },
    });
  });
});
