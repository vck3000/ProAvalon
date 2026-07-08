/**
 * Integration test: the replay snapshot timeline recorded through a real
 * game played via the same harness game.test.ts uses. No DB involved —
 * we inspect the recorder directly.
 */
import Game, { GameConfig, NUM_PLAYERS_ON_MISSION } from '../game';
import { RoomConfig } from '../room';
import { GameMode } from '../gameModes';
import { ReadyPrompt } from '../../../sockets/readyPrompt';
import { RoomCreationType } from '../roomTypes';
import { Phase } from '../phases/types';
import { validateReplayDoc } from '../replayTypes';

jest.mock('../gameWrapper');
jest.mock('../../../models/gameRecord');
jest.mock('../../../models/user');
jest.mock('../../../models/RatingPeriodGameRecord');

describe('Replay snapshot integration', () => {
  let game: Game;
  let testSockets: any[] = [];

  beforeEach(() => {
    testSockets = [];
    for (let i = 0; i < 10; i++) {
      testSockets.push({
        request: { user: { username: i.toString() } },
        emit: jest.fn(),
      });
    }
    const roomConfig: RoomConfig = new RoomConfig(
      '1',
      1,
      jest.fn(),
      10,
      '',
      GameMode.AVALON,
      false,
      new ReadyPrompt(),
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

  const anon = (u: string): string => game.anonymizer.anon(u);
  const deAnon = (a: string): string => game.anonymizer.deAnon(a);
  const getSocketOfUsername = (username: string) => {
    for (const socket of testSockets) {
      if (socket.request.user.username === deAnon(username)) return socket;
    }
    throw new Error(`No socket for ${username}`);
  };
  const getSocketOfNextTeamPicker = () =>
    getSocketOfUsername(
      anon(game.playersInGame[game.teamLeader].request.user.username),
    );

  const startGame = (numPlayers: number) => {
    for (let i = 0; i < numPlayers; i++) {
      game.playerJoinRoom(testSockets[i], '');
      game.playerSitDown(testSockets[i]);
    }
    game.startGame([]);
    expect(game.gameStarted).toEqual(true);
  };

  const snapCount = () => (game as any).replayRecorder.getSnapshots().length;

  it('records a growing, valid snapshot timeline over a full game', () => {
    startGame(6);

    // Game start distributed data once (at minimum).
    const afterStart = snapCount();
    expect(afterStart).toBeGreaterThanOrEqual(1);
    const first = (game as any).replayRecorder.getSnapshots()[0];
    expect(first.g.phase).toBe(Phase.PickingTeam);
    expect(first.g.spectator).toBe(true);
    // Spoiler-free: no roles visible at start.
    expect(first.g.see.spies).toEqual([]);

    // roomPlayers seating recorded once, matching player count.
    const roomPlayers = (game as any).replayRecorder.getRoomPlayers();
    expect(roomPlayers).toHaveLength(6);
    expect(typeof roomPlayers[0].username).toBe('string');

    // Play three successful missions (resistance win): pick the first N
    // seats each round, everyone approves, all team members succeed.
    const missionSizes = NUM_PLAYERS_ON_MISSION[6 - 5];
    for (let mission = 0; mission < 3; mission++) {
      const teamSize = missionSizes[mission];
      const team = [];
      for (let i = 0; i < teamSize; i++) team.push(anon(String(i)));

      const beforePick = snapCount();
      game.gameMove(getSocketOfNextTeamPicker(), ['yes', team]);
      expect(snapCount()).toBeGreaterThan(beforePick);

      // Each individual vote press produces a distribute → snapshot.
      const beforeVotes = snapCount();
      for (let i = 0; i < 6; i++) {
        game.gameMove(testSockets[i], ['yes', []]);
      }
      expect(snapCount()).toBeGreaterThan(beforeVotes);

      for (let i = 0; i < teamSize; i++) {
        // Mission votes are yes/no; 'yes' succeeds regardless of alliance.
        game.gameMove(testSockets[i], ['yes', []]);
      }
    }

    expect(game.phase).toBe(Phase.Finished);

    const snaps = (game as any).replayRecorder.getSnapshots();
    const last = snaps[snaps.length - 1];
    expect(last.g.phase).toBe(Phase.Finished);
    // End-of-game reveal is part of the recorded timeline.
    expect((last.g.see.spies as string[]).length).toBeGreaterThan(0);
    expect(Array.isArray(last.g.see.roles)).toBe(true);
    // voteHistory present in snapshots (drives drawVoteHistory verbatim).
    expect(last.g.voteHistory).toBeTruthy();
    expect(Object.keys(last.g.voteHistory)).toHaveLength(6);

    // t monotonic.
    for (let i = 1; i < snaps.length; i++) {
      expect(snaps[i].t).toBeGreaterThanOrEqual(snaps[i - 1].t);
    }

    // The finalized doc (as stored/exported) validates. The game already
    // finalized via storeReplay at finish; finalize() is idempotent.
    const doc = (game as any).replayRecorder.finalize({
      finishedAt: new Date(),
      winner: game.winner,
      howTheGameWasWon: (game as any).howWasWon || '',
      fullRoles: {},
      players: game.playersInGame.map((p: any) => ({
        username: p.username,
        alliance: p.alliance,
        role: p.role,
      })),
    });
    const parsed = JSON.parse(JSON.stringify(doc));
    expect(validateReplayDoc(parsed)).toEqual({ ok: true });
    expect(parsed.snapshots.length).toBe(snaps.length);
  });

  it('mission board data in snapshots matches the live missionHistory', () => {
    startGame(5);
    // Put one known spy and one known resistance on the team; only spies
    // can play a fail card.
    const spy = game.playersInGame.find((p: any) => p.alliance === 'Spy');
    const res = game.playersInGame.find(
      (p: any) => p.alliance === 'Resistance',
    );
    const spyAnon = anon(spy.request.user.username);
    const resAnon = anon(res.request.user.username);

    game.gameMove(getSocketOfNextTeamPicker(), ['yes', [spyAnon, resAnon]]);
    for (let i = 0; i < 5; i++) game.gameMove(testSockets[i], ['yes', []]);
    game.gameMove(getSocketOfUsername(resAnon), ['yes', []]);
    game.gameMove(getSocketOfUsername(spyAnon), ['no', []]);

    const snaps = (game as any).replayRecorder.getSnapshots();
    const last = snaps[snaps.length - 1].g;
    expect(last.missionHistory).toEqual(['failed']);
    expect(last.numFailsHistory).toEqual([1]);
  });

  it('anonymous games attach a roomPlayers delta at the end-of-game reveal', () => {
    // Anonymous mode: seatings start as anon names; on finish the live game
    // re-emits room players with real names. The replay must capture that
    // transition or the end-of-game spy highlighting breaks.
    for (let i = 0; i < 6; i++) {
      game.playerJoinRoom(testSockets[i], '');
      game.playerSitDown(testSockets[i]);
    }
    game.configureAnonymousMode(true);
    game.startGame([]);

    const initialRp = (game as any).replayRecorder.getRoomPlayers();
    expect(initialRp).toHaveLength(6);
    // Anon mode: displayed usernames are not the real '0'..'5'.
    const realNames = ['0', '1', '2', '3', '4', '5'];
    expect(realNames).not.toContain(initialRp[0].username);

    const missionSizes = NUM_PLAYERS_ON_MISSION[6 - 5];
    for (let mission = 0; mission < 3; mission++) {
      const teamSize = missionSizes[mission];
      const team = [];
      for (let i = 0; i < teamSize; i++) team.push(anon(String(i)));
      game.gameMove(getSocketOfNextTeamPicker(), ['yes', team]);
      for (let i = 0; i < 6; i++) game.gameMove(testSockets[i], ['yes', []]);
      for (let i = 0; i < teamSize; i++) {
        game.gameMove(testSockets[i], ['yes', []]);
      }
    }
    expect(game.phase).toBe(Phase.Finished);

    const snaps = (game as any).replayRecorder.getSnapshots();
    const deltas = snaps.filter((s: any) => s.rp);
    expect(deltas.length).toBeGreaterThanOrEqual(1);
    const finalRp = deltas[deltas.length - 1].rp;
    // De-anonymized seating displays as "realname (anonname)".
    expect(finalRp[0].username).toMatch(/^[0-5] \(/);
    expect(finalRp[0].username).not.toBe(initialRp[0].username);
    // And the final snapshot's revealed spies use those same real names.
    const lastG = snaps[snaps.length - 1].g;
    for (const spy of lastG.see.spies as string[]) {
      expect(finalRp.map((p: any) => p.username)).toContain(spy);
    }
  });
});
