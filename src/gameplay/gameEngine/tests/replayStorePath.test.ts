/**
 * End-to-end persistence test: plays a real game and lets it flow through
 * the ACTUAL finish path — finishGame → GameRecord.create callback →
 * storeReplay → replayRecorder.finalize → Replay.create — then validates
 * the exact document that would be written to Mongo.
 *
 * This path is where the "stale finishedAt" bug lived: finishGame captures
 * timeFinished before recording its final PhaseChanged event, so the
 * GameFinished event was stamped earlier than the event before it and the
 * whole replay failed validation on view. Auto-mocked GameRecord never
 * invoked its callback, so no other test reached finalize this way.
 */
import Game, { GameConfig, NUM_PLAYERS_ON_MISSION } from '../game';
import { RoomConfig } from '../room';
import { GameMode } from '../gameModes';
import { ReadyPrompt } from '../../../sockets/readyPrompt';
import { RoomCreationType } from '../roomTypes';
import { Phase } from '../phases/types';
import { validateReplayDoc } from '../replayTypes';
import Replay from '../../../models/replay';
import GameRecord from '../../../models/gameRecord';

jest.mock('../gameWrapper');
jest.mock('../../../models/user');
jest.mock('../../../models/RatingPeriodGameRecord');
// GameRecord.create must invoke its callback for storeReplay to run.
jest.mock('../../../models/gameRecord', () => ({
  __esModule: true,
  default: {
    create: jest.fn((obj: any, cb: any) =>
      cb(null, { _id: 'gamerecord-id-123' }),
    ),
  },
}));
jest.mock('../../../models/replay', () => ({
  __esModule: true,
  REPLAY_TTL_MS: 7 * 24 * 60 * 60 * 1000,
  default: {
    create: jest.fn((doc: any, cb: any) => cb(null, { _id: 'replay-id-456' })),
  },
}));

describe('Replay persistence through the real finish path', () => {
  it('the doc handed to Replay.create validates', () => {
    const testSockets: any[] = [];
    for (let i = 0; i < 10; i++) {
      testSockets.push({
        request: { user: { username: `p${i}` } },
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
    const gameConfig = new GameConfig(
      roomConfig,
      false,
      false,
      RoomCreationType.CUSTOM_ROOM,
      () => new Date(), // real wall clock, like production
    );
    const game: any = new Game(gameConfig);

    for (let i = 0; i < 6; i++) {
      game.playerJoinRoom(testSockets[i], '');
      game.playerSitDown(testSockets[i]);
    }
    game.startGame([]);

    const anon = (u: string) => game.anonymizer.anon(u);
    const pickerSock = () => {
      const real = game.playersInGame[game.teamLeader].request.user.username;
      return testSockets.find((s) => s.request.user.username === real);
    };

    const sizes = NUM_PLAYERS_ON_MISSION[6 - 5];
    for (let mission = 0; mission < 3; mission++) {
      const team = [];
      for (let i = 0; i < sizes[mission]; i++) team.push(anon(`p${i}`));
      game.gameMove(pickerSock(), ['yes', team]);
      for (let i = 0; i < 6; i++) game.gameMove(testSockets[i], ['yes', []]);

      if (mission === 2) {
        // In production, real work happens between finishGame's
        // `timeFinished = new Date()` capture and the PhaseChanged event
        // that changePhase records a moment later. Jest compresses that
        // gap to <1ms, which masked the stale-finishedAt bug. Busy-wait
        // 3ms in front of every recordEvent to restore the real spacing.
        const rec = game.replayRecorder;
        const original = rec.recordEvent.bind(rec);
        rec.recordEvent = (...args: any[]) => {
          const until = Date.now() + 3;
          while (Date.now() < until) {
            /* busy wait */
          }
          return original(...args);
        };
      }

      for (let i = 0; i < sizes[mission]; i++) {
        game.gameMove(testSockets[i], ['yes', []]);
      }
    }
    expect(game.phase).toBe(Phase.Finished);

    // finishGame ran storeReplay synchronously through the mocked
    // GameRecord callback.
    const replayCreate = (Replay as any).create as jest.Mock;
    expect((GameRecord as any).create).toHaveBeenCalled();
    expect(replayCreate).toHaveBeenCalledTimes(1);

    const stored = replayCreate.mock.calls[0][0];
    // Round-trip through JSON like the export/import path does.
    const parsed = JSON.parse(JSON.stringify(stored));
    // The stored doc has extra persistence fields (gameRecordId as ObjectId,
    // expiresAt); validation runs on the ReplayDoc shape the routes serve.
    const docForValidation = {
      schemaVersion: parsed.schemaVersion,
      gameRecordId: String(parsed.gameRecordId || ''),
      timeGameStarted: parsed.timeGameStarted,
      timeGameFinished: parsed.timeGameFinished,
      gameMode: parsed.gameMode,
      anonymousMode: parsed.anonymousMode,
      numberOfPlayers: parsed.numberOfPlayers,
      players: parsed.players,
      roles: parsed.roles,
      cards: parsed.cards,
      winner: parsed.winner,
      howTheGameWasWon: parsed.howTheGameWasWon,
      events: parsed.events,
      chat: parsed.chat,
      snapshots: parsed.snapshots,
      roomPlayers: parsed.roomPlayers,
    };
    expect(validateReplayDoc(docForValidation)).toEqual({ ok: true });

    // The specific regression: GameFinished must not be stamped earlier
    // than the PhaseChanged(Finished) event recorded just before it.
    const events = parsed.events;
    const last = events[events.length - 1];
    expect(last.k).toBe('gameFinished');
    for (let i = 1; i < events.length; i++) {
      expect(events[i].t).toBeGreaterThanOrEqual(events[i - 1].t);
    }
  });
});
