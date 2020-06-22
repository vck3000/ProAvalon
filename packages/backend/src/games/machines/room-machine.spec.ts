import { interpret, Interpreter } from 'xstate';
import {
  RoomMachine,
  RoomContext,
  RoomStateSchema,
  RoomEvent,
  RoomPlayer,
} from './room-machine';

describe('RoomMachine', () => {
  let service: Interpreter<RoomContext, RoomStateSchema, RoomEvent, any>;
  let mockPlayers: RoomPlayer[];

  beforeEach(() => {
    service = interpret(RoomMachine).start();

    mockPlayers = [
      {
        id: '123',
        username: 'pronub',
        displayUsername: 'ProNub',
      },
    ];
  });

  it('should be able to let a user join, sit down, stand up, and leave correctly', () => {
    const { context } = service.state;

    service.send('PLAYER_JOIN', { player: mockPlayers[0] });
    expect(context.spectators).toEqual(
      expect.arrayContaining([mockPlayers[0]]),
    );
    expect(context.players.length).toEqual(0);

    service.send('PLAYER_SIT_DOWN', { player: mockPlayers[0] });
    expect(context.spectators.length).toEqual(0);
    expect(context.players).toEqual(expect.arrayContaining([mockPlayers[0]]));

    service.send('PLAYER_STAND_UP', { player: mockPlayers[0] });
    expect(context.spectators).toEqual(
      expect.arrayContaining([mockPlayers[0]]),
    );
    expect(context.players.length).toEqual(0);

    service.send('PLAYER_LEAVE', { player: mockPlayers[0] });
    expect(context.players.length).toEqual(0);
    expect(context.spectators.length).toEqual(0);
  });

  it('should be able to let a user leave while sat down', () => {
    const { context } = service.state;

    service.send('PLAYER_JOIN', { player: mockPlayers[0] });
    service.send('PLAYER_SIT_DOWN', { player: mockPlayers[0] });

    service.send('PLAYER_LEAVE', { player: mockPlayers[0] });
    expect(context.players.length).toEqual(0);
    expect(context.spectators.length).toEqual(0);
  });
});
