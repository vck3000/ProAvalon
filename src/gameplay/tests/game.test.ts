import Game, { GameConfig } from '../game';
import { RoomConfig } from '../room';
import { GameMode } from '../gameModes';
import { ReadyPrompt } from '../../sockets/readyPrompt';
import { RoomCreationType } from '../roomTypes';
import { Phase } from '../phases/types';
import { Alliance } from '../types';

jest.mock('../gameWrapper');

describe('Game Engine', () => {
  let game: Game;
  let readyPrompt: ReadyPrompt;
  let getDate: () => Date = jest.fn();

  const password = '';
  let testSockets: any[] = [];

  beforeEach(() => {
    readyPrompt = new ReadyPrompt();
    getDate = jest.fn();

    testSockets = [];
    for (let i = 0; i < 10; i++) {
      testSockets.push({
        request: {
          user: {
            username: i.toString(),
          },
        },
        emit: jest.fn(),
      });
    }

    const roomConfig: RoomConfig = new RoomConfig(
      '1',
      1,
      jest.fn(),
      10,
      password,
      GameMode.AVALON,
      false,
      readyPrompt,
    );
    const gameConfig: GameConfig = new GameConfig(
      roomConfig,
      false,
      false,
      RoomCreationType.CUSTOM_ROOM,
      jest.fn(),
    );

    game = new Game(gameConfig);
  });

  const startGame = (numPlayers: number, options: string[]) => {
    for (let i = 0; i < numPlayers; i++) {
      game.playerJoinRoom(testSockets[i], password);
      game.playerSitDown(testSockets[i]);
    }

    game.startGame(options);
    expect(game.gameStarted).toEqual(true);
  };
  const votePickTeam = (approve: boolean) => {
    for (let i = 0; i < game.playersInGame.length; i++) {
      game.gameMove(testSockets[i], [approve ? 'yes' : 'no', []]);
    }
  };

  const getSocketOfUsername = (username: string) => {
    for (const socket of testSockets) {
      if (socket.request.user.username === username) {
        return socket;
      }
    }
    throw new Error(`Could not find socket of username: ${username}`);
  };

  const getSocketOfNextTeamPicker = (): any => {
    const index = game.teamLeader;
    const username = game.playersInGame[index].request.user.username;

    return getSocketOfUsername(username);
  };

  const getUsernameOfRole = (role: string) => {
    for (const player of game.playersInGame) {
      if (player.role === role) {
        return player.request.user.username;
      }
    }
    throw new Error(`Could not find role ${role}`);
  };

  const getUsernamesOfAlliance = (alliance: Alliance): string[] => {
    const list = [];
    for (const player of game.playersInGame) {
      if (player.alliance === alliance) {
        list.push(player.request.user.username);
      }
    }
    return list;
  };

  // TODO replace string with type
  const getSocketOfRole = (role: string): any => {
    const username = getUsernameOfRole(role);
    return getSocketOfUsername(username);
  };

  const playGameToResWin = () => {
    expect(game.phase).toEqual(Phase.pickingTeam);
    expect(game.missionNum).toEqual(1);
    expect(game.pickNum).toEqual(1);

    // 1.1
    game.gameMove(getSocketOfNextTeamPicker(), ['yes', ['0', '1']]);
    expect(game.phase).toEqual(Phase.votingTeam);
    expect(game.missionNum).toEqual(1);
    expect(game.pickNum).toEqual(1);

    votePickTeam(false);
    expect(game.phase).toEqual(Phase.pickingTeam);
    expect(game.missionNum).toEqual(1);
    expect(game.pickNum).toEqual(2);

    // 1.2
    game.gameMove(getSocketOfNextTeamPicker(), ['yes', ['1', '2']]);
    expect(game.phase).toEqual(Phase.votingTeam);
    expect(game.missionNum).toEqual(1);
    expect(game.pickNum).toEqual(2);

    votePickTeam(true);
    expect(game.phase).toEqual(Phase.votingMission);
    expect(game.missionNum).toEqual(1);
    expect(game.pickNum).toEqual(2);

    game.gameMove(testSockets[1], ['yes', []]);
    game.gameMove(testSockets[2], ['yes', []]);
    expect(game.phase).toEqual(Phase.pickingTeam);
    expect(game.missionNum).toEqual(2);
    expect(game.pickNum).toEqual(1);

    // 2.1
    game.gameMove(getSocketOfNextTeamPicker(), ['yes', ['1', '2', '3']]);
    expect(game.phase).toEqual(Phase.votingTeam);
    expect(game.missionNum).toEqual(2);
    expect(game.pickNum).toEqual(1);

    votePickTeam(true);
    expect(game.phase).toEqual(Phase.votingMission);

    game.gameMove(testSockets[1], ['yes', []]);
    game.gameMove(testSockets[2], ['yes', []]);
    game.gameMove(testSockets[3], ['yes', []]);
    expect(game.phase).toEqual(Phase.pickingTeam);
    expect(game.missionNum).toEqual(3);
    expect(game.pickNum).toEqual(1);

    // 3.1
    game.gameMove(getSocketOfNextTeamPicker(), ['yes', ['1', '2', '3', '4']]);
    expect(game.phase).toEqual(Phase.votingTeam);
    expect(game.missionNum).toEqual(3);
    expect(game.pickNum).toEqual(1);

    votePickTeam(true);
    expect(game.phase).toEqual(Phase.votingMission);

    game.gameMove(testSockets[1], ['yes', []]);
    game.gameMove(testSockets[2], ['yes', []]);
    game.gameMove(testSockets[3], ['yes', []]);
    game.gameMove(testSockets[4], ['yes', []]);
  };

  describe('6P vanilla games', () => {
    beforeEach(() => {
      // Vanilla game - no roles
      startGame(6, []);
    });

    it('Resistance wins', () => {
      playGameToResWin();

      // Game over
      expect(game.phase).toEqual(Phase.finished);
      expect(game.winner).toEqual(Alliance.Resistance);
    });

    it('Spy wins via failed missions', () => {
      const resUsernames = getUsernamesOfAlliance(Alliance.Resistance);
      const spyUsernames = getUsernamesOfAlliance(Alliance.Spy);
      expect(resUsernames.length).toEqual(4);
      expect(spyUsernames.length).toEqual(2);

      expect(game.phase).toEqual(Phase.pickingTeam);
      expect(game.missionNum).toEqual(1);
      expect(game.pickNum).toEqual(1);

      // 1.1
      game.gameMove(getSocketOfNextTeamPicker(), ['yes', spyUsernames]);
      expect(game.phase).toEqual(Phase.votingTeam);
      expect(game.missionNum).toEqual(1);
      expect(game.pickNum).toEqual(1);

      votePickTeam(true);
      expect(game.phase).toEqual(Phase.votingMission);
      expect(game.missionNum).toEqual(1);
      expect(game.pickNum).toEqual(1);

      // Only one fail needed
      game.gameMove(getSocketOfUsername(spyUsernames[0]), ['no', []]);
      game.gameMove(getSocketOfUsername(spyUsernames[1]), ['yes', []]);
      expect(game.phase).toEqual(Phase.pickingTeam);
      expect(game.missionNum).toEqual(2);
      expect(game.pickNum).toEqual(1);

      // 2.1
      game.gameMove(getSocketOfNextTeamPicker(), [
        'yes',
        [spyUsernames[0], spyUsernames[1], resUsernames[0]],
      ]);
      expect(game.phase).toEqual(Phase.votingTeam);
      expect(game.missionNum).toEqual(2);
      expect(game.pickNum).toEqual(1);

      votePickTeam(true);
      expect(game.phase).toEqual(Phase.votingMission);

      game.gameMove(getSocketOfUsername(spyUsernames[0]), ['no', []]);
      game.gameMove(getSocketOfUsername(spyUsernames[1]), ['yes', []]);
      game.gameMove(getSocketOfUsername(resUsernames[0]), ['yes', []]);
      expect(game.phase).toEqual(Phase.pickingTeam);
      expect(game.missionNum).toEqual(3);
      expect(game.pickNum).toEqual(1);

      // 3.1
      game.gameMove(getSocketOfNextTeamPicker(), [
        'yes',
        [spyUsernames[0], spyUsernames[1], resUsernames[0], resUsernames[1]],
      ]);
      expect(game.phase).toEqual(Phase.votingTeam);
      expect(game.missionNum).toEqual(3);
      expect(game.pickNum).toEqual(1);

      votePickTeam(true);
      expect(game.phase).toEqual(Phase.votingMission);

      game.gameMove(getSocketOfUsername(spyUsernames[0]), ['no', []]);
      game.gameMove(getSocketOfUsername(spyUsernames[1]), ['yes', []]);
      game.gameMove(getSocketOfUsername(resUsernames[0]), ['yes', []]);
      game.gameMove(getSocketOfUsername(resUsernames[1]), ['yes', []]);

      expect(game.phase).toEqual(Phase.finished);
      expect(game.winner).toEqual(Alliance.Spy);
    });

    it('Spy wins via hammer reject', () => {
      for (let i = 0; i < 5; i++) {
        expect(game.phase).toEqual(Phase.pickingTeam);
        expect(game.missionNum).toEqual(1);
        expect(game.pickNum).toEqual(i + 1);

        game.gameMove(getSocketOfNextTeamPicker(), ['yes', ['1', '2']]);
        expect(game.phase).toEqual(Phase.votingTeam);

        for (const socket of testSockets) {
          game.gameMove(socket, ['no', []]);
        }
      }

      expect(game.phase).toEqual(Phase.finished);
      expect(game.winner).toEqual(Alliance.Spy);
    });
  });

  describe('6P Avalon game', () => {
    beforeEach(() => {
      startGame(6, ['Merlin', 'Percival', 'Assassin', 'Morgana']);
    });

    it('Assassin shoots Percival', () => {
      playGameToResWin();

      expect(game.phase).toEqual(Phase.assassination);

      // Shoot percival to give res the win
      const assassinSocket = getSocketOfRole('Assassin');
      const percyUsername = getUsernameOfRole('Percival');
      game.gameMove(assassinSocket, ['yes', [percyUsername]]);

      // Game over
      expect(game.phase).toEqual(Phase.finished);
      expect(game.winner).toEqual(Alliance.Resistance);
    });

    it('Assassin shoots Merlin', () => {
      playGameToResWin();

      expect(game.phase).toEqual(Phase.assassination);

      // Shoot percival to give res the win
      const assassinSocket = getSocketOfRole('Assassin');
      const percyUsername = getUsernameOfRole('Merlin');
      game.gameMove(assassinSocket, ['yes', [percyUsername]]);

      // Game over
      expect(game.phase).toEqual(Phase.finished);
      expect(game.winner).toEqual(Alliance.Spy);
    });
  });
});
