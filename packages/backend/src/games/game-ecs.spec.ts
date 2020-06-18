import { GameEvent, GameEvents } from '@proavalon/proto/game';
import GameECS from './game-ecs';
import { CSeeAlliance, CVoteTeam } from './game-components';
import { SVoteTeam } from './game-systems';
import { SocketUser } from '../users/users.socket';
import { ROLES } from './game-assemblages';

// Simple generator to create new mock sockets
function* mockSocketGen(): Generator<SocketUser, SocketUser, SocketUser> {
  let id = 1;
  while (true) {
    const socket: unknown = {
      id,
      user: {
        displayUsername: `player${id}`,
      },
      emit: jest.fn(),
    };

    yield socket as SocketUser;

    id += 1;
  }
}

describe('GameECS [Base]', () => {
  let game: GameECS;
  const mockSocketsIter = mockSocketGen();

  beforeEach(() => {
    game = new GameECS();
  });

  it('can start with some roles', () => {
    game.addEntityRole('resistance', mockSocketsIter.next().value);
    game.addEntityRole('spy', mockSocketsIter.next().value);
    game.addEntityRole('merlin', mockSocketsIter.next().value);
    game.addEntityRole('assassin', mockSocketsIter.next().value);

    expect(game.entities.length).toBe(4);
  });

  it('gives player entities required components', () => {
    game.addEntityRole('resistance', mockSocketsIter.next().value);

    expect(game.entities[0].components).toHaveProperty('player');
    expect(game.entities[0].components).toHaveProperty('voteTeam');
    expect(game.entities[0].components).toHaveProperty('voteMission');
    expect(game.entities[0].components).toHaveProperty('alliance');
  });

  it('merlin can see the spies', () => {
    game.addEntityRole('merlin', mockSocketsIter.next().value);

    expect(game.entities[0].components).toHaveProperty('seeAlliance');

    // Merlin should see standard spies
    expect(
      (game.entities[0].components.seeAlliance as CSeeAlliance).visibleRoles,
    ).toEqual(expect.arrayContaining(['spy', 'assassin']));

    // Merlin shouldn't see oberon
    expect(
      (game.entities[0].components.seeAlliance as CSeeAlliance).visibleRoles,
    ).not.toEqual(expect.arrayContaining(['oberon']));
  });
});

describe('GameECS [Voting]', () => {
  let game: GameECS;
  let mockSockets: SocketUser[];
  let approve: GameEvent;
  let reject: GameEvent;
  const mockSocketsIter = mockSocketGen();

  beforeEach(() => {
    game = new GameECS();
    game.addSystem(new SVoteTeam());

    const roles: ROLES[] = [
      ROLES.RESISTANCE,
      ROLES.RESISTANCE,
      ROLES.RESISTANCE,
      ROLES.SPY,
      ROLES.MERLIN,
      ROLES.ASSASSIN,
    ];

    mockSockets = [];

    // Seed some starting sockets and roles
    roles.forEach((role) => {
      const socket = mockSocketsIter.next().value;
      mockSockets.push(socket);

      game.addEntityRole(role, socket);
    });

    approve = {
      type: GameEvents.VOTE_TEAM,
      data: { vote: 'approve' },
    };

    reject = {
      type: GameEvents.VOTE_TEAM,
      data: { vote: 'reject' },
    };
  });

  it('can accept player votes', async () => {
    // Simulate some votes
    await game.event(mockSockets[0], approve);
    await game.event(mockSockets[1], reject);

    expect((game.entities[0].components.voteTeam as CVoteTeam).vote).toBe(
      'approve',
    );

    expect((game.entities[1].components.voteTeam as CVoteTeam).vote).toBe(
      'reject',
    );

    expect(
      (game.entities[2].components.voteTeam as CVoteTeam).vote,
    ).toBeUndefined();

    // console.log(players);
    // console.log(JSON.stringify(game.entities, null, 2));
  }, 500);

  it('system can calculate approved team proposal', async () => {
    // Simulate some votes
    await game.event(mockSockets[0], approve);
    await game.event(mockSockets[1], approve);
    await game.event(mockSockets[2], approve);
    await game.event(mockSockets[3], approve);
    await game.event(mockSockets[4], reject);
    await game.event(mockSockets[5], reject);

    // TODO: Add in asserts for team approved

    // console.log(players);
    // console.log(JSON.stringify(game.entities, null, 2));
  }, 500);

  it('system can calculate rejected team proposal', async () => {
    // Simulate some votes
    await game.event(mockSockets[0], approve);
    await game.event(mockSockets[1], approve);
    await game.event(mockSockets[2], approve);
    await game.event(mockSockets[3], reject);
    await game.event(mockSockets[4], reject);
    await game.event(mockSockets[5], reject);

    // TODO: Add in asserts for team rejected

    // console.log(players);
    // console.log(JSON.stringify(game.entities, null, 2));
  }, 500);
});
