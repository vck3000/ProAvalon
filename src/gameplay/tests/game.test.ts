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

  const anon = (username: string): string => {
    return game.anonymizer.anon(username);
  };

  const deAnon = (anon: string): string => {
    return game.anonymizer.deAnon(anon);
  };

  const getSocketOfUsername = (username: string) => {
    for (const socket of testSockets) {
      if (socket.request.user.username === deAnon(username)) {
        return socket;
      }
    }
    throw new Error(`Could not find socket of username: ${username}`);
  };

  const getSocketOfNextTeamPicker = (): any => {
    const index = game.teamLeader;
    const username = anon(game.playersInGame[index].request.user.username);

    return getSocketOfUsername(username);
  };

  const getUsernameOfRole = (role: string) => {
    for (const player of game.playersInGame) {
      if (player.role === role) {
        return anon(player.request.user.username);
      }
    }
    throw new Error(`Could not find role ${role}`);
  };

  const getUsernamesOfAlliance = (alliance: Alliance): string[] => {
    const list = [];
    for (const player of game.playersInGame) {
      if (player.alliance === alliance) {
        list.push(anon(player.request.user.username));
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
    expect(game.phase).toEqual(Phase.PickingTeam);

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
    expect(game.phase).toEqual(Phase.VotingTeam);
    for (const socket of testSockets) {
      // Everyone approves
      game.gameMove(socket, ['yes', []]);
    }

    // Voting mission
    expect(game.phase).toEqual(Phase.VotingMission);
    for (const username of usernamesToPick) {
      const socket = getSocketOfUsername(username);

      const button = spyUsernames.includes(username) ? 'no' : 'yes';
      game.gameMove(socket, [button, []]);
    }
  };

  const playGameToResWin = () => {
    expect(game.phase).toEqual(Phase.PickingTeam);
    expect(game.missionNum).toEqual(1);
    expect(game.pickNum).toEqual(1);

    // 1.1
    game.gameMove(getSocketOfNextTeamPicker(), ['yes', [anon('0'), anon('1')]]);
    expect(game.phase).toEqual(Phase.VotingTeam);
    expect(game.missionNum).toEqual(1);
    expect(game.pickNum).toEqual(1);

    // Reject team to test
    for (let i = 0; i < game.playersInGame.length; i++) {
      game.gameMove(testSockets[i], ['no', []]);
    }
    expect(game.phase).toEqual(Phase.PickingTeam);
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

  describe('6P Vanilla game', () => {
    beforeEach(() => {
      // Vanilla game - no roles
      startGame(6, []);
    });

    it('Resistance wins', () => {
      playGameToResWin();

      // Game over
      expect(game.phase).toEqual(Phase.Finished);
      expect(game.winner).toEqual(Alliance.Resistance);
    });

    it('Spy wins via failed missions', () => {
      playMission(false);
      playMission(false);
      playMission(false);

      expect(game.phase).toEqual(Phase.Finished);
      expect(game.winner).toEqual(Alliance.Spy);
    });

    it('Spy wins via hammer reject', () => {
      for (let i = 0; i < 5; i++) {
        expect(game.phase).toEqual(Phase.PickingTeam);
        expect(game.missionNum).toEqual(1);
        expect(game.pickNum).toEqual(i + 1);

        game.gameMove(getSocketOfNextTeamPicker(), [
          'yes',
          [anon('1'), anon('2')],
        ]);
        expect(game.phase).toEqual(Phase.VotingTeam);

        for (const socket of testSockets) {
          game.gameMove(socket, ['no', []]);
        }
      }

      expect(game.phase).toEqual(Phase.Finished);
      expect(game.winner).toEqual(Alliance.Spy);
    });
  });

  describe('6P Avalon game', () => {
    beforeEach(() => {
      startGame(6, [Role.Merlin, Role.Percival, Role.Assassin, Role.Morgana]);
    });

    it('Assassin shoots Percival', () => {
      playGameToResWin();

      expect(game.phase).toEqual(Phase.Assassination);

      // Shoot percival to give res the win
      const assassinSocket = getSocketOfRole(Role.Assassin);
      const percyUsername = getUsernameOfRole(Role.Percival);
      game.gameMove(assassinSocket, ['yes', [percyUsername]]);

      // Game over
      expect(game.phase).toEqual(Phase.Finished);
      expect(game.winner).toEqual(Alliance.Resistance);
    });

    it('Assassin shoots Merlin', () => {
      playGameToResWin();

      expect(game.phase).toEqual(Phase.Assassination);

      // Shoot percival to give res the win
      const assassinSocket = getSocketOfRole(Role.Assassin);
      const percyUsername = getUsernameOfRole(Role.Merlin);
      game.gameMove(assassinSocket, ['yes', [percyUsername]]);

      // Game over
      expect(game.phase).toEqual(Phase.Finished);
      expect(game.winner).toEqual(Alliance.Spy);
    });
  });

  describe('MordredAssassin', () => {
    beforeEach(() => {
      startGame(6, [
        Role.Merlin,
        Role.Percival,
        Role.MordredAssassin,
        Role.Morgana,
      ]);
    });

    it('MordredAssassin shoots Percival', () => {
      playGameToResWin();

      expect(game.phase).toEqual(Phase.Assassination);

      // Shoot percival to give res the win
      const assassinSocket = getSocketOfRole(Role.MordredAssassin);
      const percyUsername = getUsernameOfRole(Role.Percival);
      game.gameMove(assassinSocket, ['yes', [percyUsername]]);

      // Game over
      expect(game.phase).toEqual(Phase.Finished);
      expect(game.winner).toEqual(Alliance.Resistance);
    });

    it('MordredAssassin shoots Merlin', () => {
      playGameToResWin();

      expect(game.phase).toEqual(Phase.Assassination);

      // Shoot percival to give res the win
      const assassinSocket = getSocketOfRole(Role.MordredAssassin);
      const percyUsername = getUsernameOfRole(Role.Merlin);
      game.gameMove(assassinSocket, ['yes', [percyUsername]]);

      // Game over
      expect(game.phase).toEqual(Phase.Finished);
      expect(game.winner).toEqual(Alliance.Spy);
    });
  });

  describe('6P Avalon game with Lady of the Lake', () => {
    let cardedPeople: Set<string>;

    beforeEach(() => {
      startGame(6, [
        Role.Merlin,
        Role.Percival,
        Role.Assassin,
        Role.Morgana,
        Card.LadyOfTheLake,
      ]);

      cardedPeople = new Set();
    });

    const cardSomeone = (cardHolder = false) => {
      const indexHolder =
        game.specialCards[Card.LadyOfTheLake].indexOfPlayerHolding;
      const usernameHolder = anon(
        game.playersInGame[indexHolder].request.user.username,
      );
      cardedPeople.add(usernameHolder);

      const socketHolder = getSocketOfUsername(usernameHolder);

      let username;
      if (cardHolder) {
        username = usernameHolder;
      } else {
        const validUsernames = game.playersInGame
          .map((player) => anon(player.request.user.username))
          .filter((username) => !cardedPeople.has(username));

        username = validUsernames[0];
      }

      game.gameMove(socketHolder, ['yes', [username]]);

      // Sanity check that lady is now at the intended target
      {
        const indexHolder =
          game.specialCards[Card.LadyOfTheLake].indexOfPlayerHolding;
        const usernameHolder = anon(
          game.playersInGame[indexHolder].request.user.username,
        );

        expect(usernameHolder).toEqual(username);
      }
    };

    it('Plays with lady of the lake', () => {
      playMission(true);
      playMission(true);

      expect(game.phase).toEqual(Phase.Lady);

      // Can't card yourself
      cardSomeone(true);
      expect(game.phase).toEqual(Phase.Lady);

      // Card someone else
      cardSomeone();
      expect(game.phase).toEqual(Phase.PickingTeam);

      playMission(false);
      expect(game.phase).toEqual(Phase.Lady);

      cardSomeone();
      expect(game.phase).toEqual(Phase.PickingTeam);

      playMission(true);

      // Shoot percival to give res the win
      const assassinSocket = getSocketOfRole(Role.Assassin);
      const percyUsername = getUsernameOfRole(Role.Merlin);
      game.gameMove(assassinSocket, ['yes', [percyUsername]]);

      // Game over
      expect(game.phase).toEqual(Phase.Finished);
      expect(game.winner).toEqual(Alliance.Spy);
    });
  });

  describe('Check Options', () => {
    it('Allows fab 4', () => {
      const checkOptions = Game.checkOptions([
        Role.Merlin,
        Role.Assassin,
        Role.Percival,
        Role.Morgana,
      ]);
      expect(checkOptions).toEqual({
        success: true,
        errMessage: '',
      });
    });

    it('Disallows both Assassin and MordredAssassin', () => {
      const checkOptions = Game.checkOptions([
        Role.Assassin,
        Role.MordredAssassin,
      ]);
      expect(checkOptions).toEqual({
        success: false,
        errMessage:
          'Cannot start a game with both Assassin and MordredAssassin',
      });
    });
  });
});
