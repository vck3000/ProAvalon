import { interpret, Interpreter } from 'xstate';
import {
  RoomMachine,
  RoomContext,
  RoomStateSchema,
  RoomEvents,
} from './room-machine';

function* mockPlayerGen() {
  let socketId = 1;
  let username = 'a';
  let displayUsername = username.toUpperCase();

  while (true) {
    yield {
      socketId: socketId.toString(),
      username,
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

    service.send('PLAYER_JOIN', { player });
    expect(service.state.context.players.length).toEqual(0);
    expect(service.state.context.spectators[0].state.context.player).toEqual(
      player,
    );

    service.send('PLAYER_SIT_DOWN', { player });
    expect(service.state.context.players[0].state.context.player).toEqual(
      player,
    );
    expect(service.state.context.spectators.length).toEqual(0);

    service.send('PLAYER_STAND_UP', { player });
    expect(service.state.context.players.length).toEqual(0);
    expect(service.state.context.spectators[0].state.context.player).toEqual(
      player,
    );

    service.send('PLAYER_LEAVE', { player });
    expect(service.state.context.players.length).toEqual(0);
    expect(service.state.context.spectators.length).toEqual(0);
  });

  it('should be able to let a user leave while sat down', () => {
    const { context } = service.state;

    const gen = mockPlayerGen();
    const player = gen.next().value;

    service.send('PLAYER_JOIN', { player });
    service.send('PLAYER_SIT_DOWN', { player });

    service.send('PLAYER_LEAVE', { player });
    expect(context.players.length).toEqual(0);
    expect(context.spectators.length).toEqual(0);
  });

  it('should only start game if there are at least 5 players sitting down', () => {
    const gen = mockPlayerGen();

    // Only add 4 players
    for (let i = 0; i < 4; i += 1) {
      const player = gen.next().value;
      service.send('PLAYER_JOIN', { player });
      service.send('PLAYER_SIT_DOWN', { player });
    }

    // Should not start
    service.send('START_GAME');
    expect(service.state.value).toEqual('waiting');

    // Join the 5th player
    const player = gen.next().value;
    service.send('PLAYER_JOIN', { player });

    // Should not start if player hasn't sat down
    service.send('START_GAME');
    expect(service.state.value).toEqual('waiting');

    // Should start now
    service.send('PLAYER_SIT_DOWN', { player });

    service.send('START_GAME');
    expect(service.state.value).toEqual({
      game: { standard: 'pick', special: 'idle' },
    });
  });

  it('should not allow duplicate users', () => {
    const gen = mockPlayerGen();
    const player = gen.next().value;

    service.send('PLAYER_JOIN', { player });
    service.send('PLAYER_JOIN', { player });

    expect(service.state.context.spectators.length).toEqual(1);
    expect(service.state.context.players.length).toEqual(0);
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
      service.send('PLAYER_JOIN', { player });
      service.send('PLAYER_SIT_DOWN', { player });
    }

    service.send('START_GAME');
  });

  it('should be able to transition between pick and vote', () => {
    expect(service.state.value).toMatchObject({ game: { standard: 'pick' } });
    const { leader } = service.state.context.game;

    service.send('PICK', { player: mockPlayers[leader] });

    expect(service.state.value).toMatchObject({
      game: {
        standard: 'voteTeam',
      },
    });

    // Expect no change for PICK event in a VOTE state
    service.send('PICK', { player: mockPlayers[leader] });
    expect(service.state.value).toMatchObject({
      game: {
        standard: 'voteTeam',
      },
    });

    service.send('VOTE_TEAM');
    expect(service.state.value).toMatchObject({
      game: {
        standard: 'pick',
      },
    });
  });

  it('should only pick if requester is leader', () => {
    expect(service.state.value).toMatchObject({ game: { standard: 'pick' } });

    const { leader } = service.state.context.game;

    // Send from wrong leader
    service.send('PICK', {
      player: mockPlayers[(leader + 1) % mockPlayers.length],
    });
    expect(service.state.value).toMatchObject({
      game: {
        standard: 'pick',
      },
    });

    // Send from correct leader
    service.send('PICK', { player: mockPlayers[leader] });
    expect(service.state.value).toMatchObject({
      game: {
        standard: 'voteTeam',
      },
    });

    // Expect no change for PICK event in a VOTE state
    service.send('PICK', { player: mockPlayers[leader] });
    expect(service.state.value).toMatchObject({
      game: {
        standard: 'voteTeam',
      },
    });

    service.send('VOTE_TEAM');
    expect(service.state.value).toMatchObject({
      game: {
        standard: 'pick',
      },
    });
  });

  it('should not be able to transition standard states in special state', () => {
    const { leader } = service.state.context.game;
    // Starting state
    expect(service.state.value).toEqual({
      game: { standard: 'pick', special: 'idle' },
    });

    service.send('SPECIAL_STATE_ENTER');

    // Enter special state
    expect(service.state.value).toEqual({
      game: { standard: 'pick', special: 'active' },
    });

    service.send('PICK', { player: mockPlayers[leader] });

    // Should not transition in standard states
    expect(service.state.value).toEqual({
      game: { standard: 'pick', special: 'active' },
    });

    service.send('SPECIAL_STATE_LEAVE');

    // Leave special state
    expect(service.state.value).toEqual({
      game: { standard: 'pick', special: 'idle' },
    });

    // Enter voteTeam state
    service.send('PICK', { player: mockPlayers[leader] });
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
  it.only('should go into a special state correctly', () => {
    expect(service.state.value).toMatchObject({ game: { standard: 'pick' } });

    // Leader make a pick
    const { leader } = service.state.context.game;

    service.send('PICK', { player: mockPlayers[leader] });

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

    // Give the assassination move, then expect to be in VoteTeam
    service.send('SPECIAL', {
      // Assassin is the last player in our 6 players
      player: mockPlayers[5],
      data: { target: 'B' },
      specialType: 'assassin',
    });

    expect(service.state.value).toEqual({
      game: {
        standard: 'voteTeam',
        special: 'idle',
      },
    });

    // Expect to be able to do standard transition
    service.send('VOTE_TEAM');
    expect(service.state.value).toEqual({
      game: {
        standard: 'pick',
        special: 'idle',
      },
    });
  });
});
