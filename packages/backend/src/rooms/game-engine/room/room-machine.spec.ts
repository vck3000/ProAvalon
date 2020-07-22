import { interpret, Interpreter } from 'xstate';
import { RoomSocketEvents } from '@proavalon/proto/room';
import {
  RoomMachine,
  RoomContext,
  RoomStateSchema,
  RoomEvents,
} from './room-machine';
import { CPlayer } from '../ecs/game-components';
import { SAssassin } from '../ecs/game-systems';
import { getAllTeamVotes } from './room-machine-guards';

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
  beforeEach(() => {
    service = interpret(RoomMachine).start();
  });

  it('should be able to let a user join, sit down, stand up, and leave correctly', () => {
    const gen = mockPlayerGen();
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
    const gen = mockPlayerGen();
    const player = gen.next().value;

    service.send(RoomSocketEvents.JOIN_ROOM, { player });
    service.send(RoomSocketEvents.SIT_DOWN, { player });

    expect(service.state.context.entities.length).toEqual(1);

    service.send(RoomSocketEvents.LEAVE_ROOM, { player });
    expect(service.state.context.entities.length).toEqual(0);
  });

  it('should only start game if there are at least 5 players sitting down', () => {
    const gen = mockPlayerGen();

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
    service.send('START_GAME');
    expect(service.state.value).toEqual('waiting');

    // Should start now
    service.send(RoomSocketEvents.SIT_DOWN, { player });

    service.send('START_GAME');
    expect(service.state.value).toEqual({
      game: { standard: 'pick', special: 'idle' },
    });
  });

  it('should not allow duplicate users', () => {
    const gen = mockPlayerGen();
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

    service.send('START_GAME');
  });

  it('should be able to pick, vote and approve team', () => {
    expect(service.state.value).toMatchObject({ game: { standard: 'pick' } });
    const { leader } = service.state.context.gameData;

    service.send('PICK', {
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
        service.send('VOTE_TEAM', {
          player: mockPlayers[i],
          data: {
            vote: 'approve',
          },
        });
      } else {
        service.send('VOTE_TEAM', {
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
    service.send('VOTE_TEAM', {
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

    // Leader should advance.
    expect(service.state.context.gameData.leader).toEqual(
      (leader + 1) % (mockPlayers.length - 1),
    );

    // Should reset the votes - can remove this later if needed.
    expect(getAllTeamVotes(service.state.context)).toEqual(false);
  });

  it('should be able to pick, vote and reject team', () => {
    expect(service.state.value).toMatchObject({ game: { standard: 'pick' } });
    const { leader } = service.state.context.gameData;

    service.send('PICK', {
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
        service.send('VOTE_TEAM', {
          player: mockPlayers[i],
          data: {
            vote: 'approve',
          },
        });
      } else {
        service.send('VOTE_TEAM', {
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
    service.send('PICK', {
      player: mockPlayers[(leader + 1) % (mockPlayers.length - 1)],
      data: { team: ['C', 'D'] },
    });
    expect(service.state.value).toMatchObject({
      game: {
        standard: 'pick',
      },
    });

    // Send from correct leader
    service.send('PICK', {
      player: mockPlayers[leader],
      data: { team: ['C', 'D'] },
    });
    expect(service.state.value).toMatchObject({
      game: {
        standard: 'voteTeam',
      },
    });

    // Expect no change for PICK event in a VOTE state
    service.send('PICK', {
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
    service.send('PICK', {
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
    service.send('PICK', {
      player: mockPlayers[leader],
      data: { team: ['C', 'D'] },
    });
    expect(service.state.value).toEqual({
      game: { standard: 'voteTeam', special: 'idle' },
    });

    // Enter special state
    service.send('SPECIAL_STATE_ENTER');
    service.send('VOTE_TEAM');

    // Should be unable to transition out of voteTeam
    expect(service.state.value).toEqual({
      game: { standard: 'voteTeam', special: 'active' },
    });
  });

  // TODO This needs to be updated later for proper assassination system
  it('should go into and out of a special state correctly', () => {
    expect(service.state.value).toMatchObject({ game: { standard: 'pick' } });
    service.send('ADD_SYSTEM', { systemName: SAssassin.name });

    // Leader make a pick
    const { leader } = service.state.context.gameData;

    service.send('PICK', {
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
    service.send('VOTE_TEAM');
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
