import Game, { GameConfig, NUM_PLAYERS_ON_MISSION } from '../game';
import { RoomConfig } from '../room';
import { GameMode } from '../gameModes';
import { ReadyPrompt } from '../../sockets/readyPrompt';
import { RoomCreationType } from '../roomTypes';
import { Phase } from '../phases/types';
import { Alliance } from '../types';
import { Card } from '../cards/types';
import { Role } from '../roles/types';

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

  // Automatically plays a mission with desired outcome
  const playMission = (success: boolean) => {
    const resUsernames = getUsernamesOfAlliance(Alliance.Resistance);
    const spyUsernames = getUsernamesOfAlliance(Alliance.Spy);

    // Picking team
    expect(game.phase).toEqual(Phase.pickingTeam);

    const numOfPlayers = NUM_PLAYERS_ON_MISSION[1][game.missionNum - 1];
    const usernamesToPick = [];

    // Need to add a spy to fail if not success
    if (!success) {
      usernamesToPick.push(spyUsernames[0]);
    }

    let i = 0;
    while (usernamesToPick.length !== numOfPlayers) {
      usernamesToPick.push(resUsernames[i]);
      i++;
    }

    game.gameMove(getSocketOfNextTeamPicker(), ['yes', usernamesToPick]);

    // Voting team
    expect(game.phase).toEqual(Phase.votingTeam);
    for (const socket of testSockets) {
      // Everyone approves
      game.gameMove(socket, ['yes', []]);
    }

    // Voting mission
    expect(game.phase).toEqual(Phase.votingMission);
    for (const username of usernamesToPick) {
      const socket = getSocketOfUsername(username);

      const button = spyUsernames.includes(username) ? 'no' : 'yes';
      game.gameMove(socket, [button, []]);
    }
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

    // Reject team to test
    for (let i = 0; i < game.playersInGame.length; i++) {
      game.gameMove(testSockets[i], ['no', []]);
    }
    expect(game.phase).toEqual(Phase.pickingTeam);
    expect(game.missionNum).toEqual(1);
    expect(game.pickNum).toEqual(2);

    // 1.2
    playMission(true);
    expect(game.missionNum).toEqual(2);
    expect(game.pickNum).toEqual(1);

    // 2.1
    playMission(true);
    expect(game.missionNum).toEqual(3);
    expect(game.pickNum).toEqual(1);

    // 3.1
    playMission(true);
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
      playMission(false);
      playMission(false);
      playMission(false);

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
      startGame(6, [Role.merlin, Role.percival, Role.assassin, Role.morgana]);
    });

    it('Assassin shoots Percival', () => {
      playGameToResWin();

      expect(game.phase).toEqual(Phase.assassination);

      // Shoot percival to give res the win
      const assassinSocket = getSocketOfRole(Role.assassin);
      const percyUsername = getUsernameOfRole(Role.percival);
      game.gameMove(assassinSocket, ['yes', [percyUsername]]);

      // Game over
      expect(game.phase).toEqual(Phase.finished);
      expect(game.winner).toEqual(Alliance.Resistance);
    });

    it('Assassin shoots Merlin', () => {
      playGameToResWin();

      expect(game.phase).toEqual(Phase.assassination);

      // Shoot percival to give res the win
      const assassinSocket = getSocketOfRole(Role.assassin);
      const percyUsername = getUsernameOfRole(Role.merlin);
      game.gameMove(assassinSocket, ['yes', [percyUsername]]);

      // Game over
      expect(game.phase).toEqual(Phase.finished);
      expect(game.winner).toEqual(Alliance.Spy);
    });
  });

  describe('6P Avalon game with Lady of the Lake', () => {
    let cardedPeople: Set<string>;

    beforeEach(() => {
      startGame(6, [
        Role.merlin,
        Role.percival,
        Role.assassin,
        Role.morgana,
        Card.ladyOfTheLake,
      ]);

      cardedPeople = new Set();
    });

    const cardSomeone = (cardHolder = false) => {
      const indexHolder =
        game.specialCards[Card.ladyOfTheLake].indexOfPlayerHolding;
      const usernameHolder =
        game.playersInGame[indexHolder].request.user.username;
      cardedPeople.add(usernameHolder);

      const socketHolder = getSocketOfUsername(usernameHolder);

      let username;
      if (cardHolder) {
        username = usernameHolder;
      } else {
        const validUsernames = game.playersInGame
          .map((player) => player.request.user.username)
          .filter((username) => !cardedPeople.has(username));

        username = validUsernames[0];
      }

      game.gameMove(socketHolder, ['yes', [username]]);

      // Sanity check that lady is now at the intended target
      {
        const indexHolder =
          game.specialCards[Card.ladyOfTheLake].indexOfPlayerHolding;
        const usernameHolder =
          game.playersInGame[indexHolder].request.user.username;

        expect(usernameHolder).toEqual(username);
      }
    };

    it('Plays with lady of the lake', () => {
      playMission(true);
      playMission(true);

      expect(game.phase).toEqual(Phase.lady);

      // Can't card yourself
      cardSomeone(true);
      expect(game.phase).toEqual(Phase.lady);

      // Card someone else
      cardSomeone();
      expect(game.phase).toEqual(Phase.pickingTeam);

      playMission(false);
      expect(game.phase).toEqual(Phase.lady);

      cardSomeone();
      expect(game.phase).toEqual(Phase.pickingTeam);

      playMission(true);

      // Shoot percival to give res the win
      const assassinSocket = getSocketOfRole(Role.assassin);
      const percyUsername = getUsernameOfRole(Role.merlin);
      game.gameMove(assassinSocket, ['yes', [percyUsername]]);

      // Game over
      expect(game.phase).toEqual(Phase.finished);
      expect(game.winner).toEqual(Alliance.Spy);
    });
  });
});
