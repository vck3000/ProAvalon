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
    expect(service.state.value).toEqual({ game: 'pick' });
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

  beforeEach(() => {
    service = interpret(RoomMachine).start();

    const gen = mockPlayerGen();

    for (let i = 0; i < 6; i += 1) {
      const player = gen.next().value;
      service.send('PLAYER_JOIN', { player });
      service.send('PLAYER_SIT_DOWN', { player });
    }

    service.send('START_GAME');
  });

  it('should be able to transition between pick and vote', () => {
    // const { context } = service.state;

    expect(service.state.value).toEqual({ game: 'pick' });
    service.send('PICK');

    expect(service.state.value).toEqual({ game: 'vote' });

    // Expect no change for PICK event in a VOTE state
    service.send('PICK');
    expect(service.state.value).toEqual({ game: 'vote' });

    service.send('VOTE');
    expect(service.state.value).toEqual({ game: 'pick' });
  });
});
