/**
 * Plays a scripted 6p game (reject, genuine spy fail, resistance win, chat)
 * and writes the finalized ReplayDoc to /tmp/replay-fixture.json.
 *
 * Doubles as an end-to-end recording test and as the fixture generator for
 * the jsdom page harness in tmp-harness/replayRoom.harness.js.
 */
import * as fs from 'fs';
import Game, { GameConfig, NUM_PLAYERS_ON_MISSION } from '../game';
import { RoomConfig } from '../room';
import { GameMode } from '../gameModes';
import { ReadyPrompt } from '../../../sockets/readyPrompt';
import { RoomCreationType } from '../roomTypes';
import { Phase } from '../phases/types';

jest.mock('../gameWrapper');
jest.mock('../../../models/gameRecord');
jest.mock('../../../models/user');
jest.mock('../../../models/RatingPeriodGameRecord');

it('writes a replay fixture', () => {
  const testSockets: any[] = [];
  for (let i = 0; i < 10; i++) {
    testSockets.push({
      request: { user: { username: `player${i}` } },
      emit: jest.fn(),
    });
  }
  const roomConfig = new RoomConfig(
    '1',
    1,
    jest.fn(),
    10,
    '',
    GameMode.AVALON,
    false,
    new ReadyPrompt(),
  );
  // Wall clock, matching what server chat lines stamp on dateCreated —
  // an accelerated fake clock makes chat t non-monotonic vs snapshots.
  const gameConfig = new GameConfig(
    roomConfig,
    false,
    false,
    RoomCreationType.CUSTOM_ROOM,
    () => new Date(),
  );
  const game: any = new Game(gameConfig);

  for (let i = 0; i < 6; i++) {
    game.playerJoinRoom(testSockets[i], '');
    game.playerSitDown(testSockets[i]);
  }
  game.startGame([]);

  const anon = (u: string) => game.anonymizer.anon(u);
  const getSock = (a: string) => {
    const real = game.anonymizer.deAnon(a);
    return testSockets.find((s) => s.request.user.username === real);
  };
  const pickerSock = () =>
    getSock(anon(game.playersInGame[game.teamLeader].request.user.username));

  // Some room chat mid-game (dateCreated from the same advancing clock).
  game.addToChatHistory({
    message: 'player0: I think seat 3 is sus',
    classStr: '',
    username: 'player0',
    dateCreated: new Date(),
  });

  const sizes = NUM_PLAYERS_ON_MISSION[6 - 5];
  // Mission 1: rejected pick first, then approved + success.
  game.gameMove(pickerSock(), ['yes', [anon('player0'), anon('player1')]]);
  for (let i = 0; i < 6; i++) game.gameMove(testSockets[i], ['no', []]);
  game.gameMove(pickerSock(), ['yes', [anon('player0'), anon('player1')]]);
  for (let i = 0; i < 6; i++) game.gameMove(testSockets[i], ['yes', []]);
  for (let i = 0; i < sizes[0]; i++) {
    game.gameMove(testSockets[i], ['yes', []]);
  }

  // Mission 2 with a genuine fail (spy on team).
  const spy = game.playersInGame.find((p: any) => p.alliance === 'Spy');
  const resPlayers = game.playersInGame.filter(
    (p: any) => p.alliance === 'Resistance',
  );
  const team2 = [
    anon(spy.request.user.username),
    anon(resPlayers[0].request.user.username),
    anon(resPlayers[1].request.user.username),
  ].slice(0, sizes[1]);
  game.gameMove(pickerSock(), ['yes', team2]);
  for (let i = 0; i < 6; i++) game.gameMove(testSockets[i], ['yes', []]);
  game.gameMove(getSock(anon(spy.request.user.username)), ['no', []]);
  game.gameMove(getSock(anon(resPlayers[0].request.user.username)), [
    'yes',
    [],
  ]);
  game.gameMove(getSock(anon(resPlayers[1].request.user.username)), [
    'yes',
    [],
  ]);

  // Missions 3-4: all resistance success to reach res win (3 successes).
  for (const m of [2, 3]) {
    const size = sizes[m];
    const team = resPlayers
      .slice(0, size)
      .map((p: any) => anon(p.request.user.username));
    game.gameMove(pickerSock(), ['yes', team]);
    for (let i = 0; i < 6; i++) game.gameMove(testSockets[i], ['yes', []]);
    for (const p of resPlayers.slice(0, size)) {
      game.gameMove(getSock(anon(p.request.user.username)), ['yes', []]);
    }
    if (game.phase === Phase.Finished || game.phase === Phase.Assassination)
      break;
  }

  // Handle assassination if the game has an assassin (vanilla [] options: no).
  expect([Phase.Finished, Phase.Assassination]).toContain(game.phase);

  const doc = game.replayRecorder.finalize({
    finishedAt: new Date(),
    winner: game.winner || 'Resistance',
    howTheGameWasWon: game.howWasWon || 'Three missions succeeded.',
    fullRoles: {},
    players: game.playersInGame.map((p: any) => ({
      username: p.username,
      alliance: p.alliance,
      role: p.role,
      displayRole: p.displayRole,
      displayAlliance: p.displayAlliance,
    })),
  });
  doc.gameRecordId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
  fs.writeFileSync('/tmp/replay-fixture.json', JSON.stringify(doc, null, 2));
  expect(doc.snapshots.length).toBeGreaterThan(10);
});
