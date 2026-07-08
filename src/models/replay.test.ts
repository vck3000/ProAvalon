import Replay, { REPLAY_TTL_MS } from './replay';
import {
  REPLAY_SCHEMA_VERSION,
  ReplayEventKind,
} from '../gameplay/gameEngine/replayTypes';

describe('Replay model', () => {
  it('exports a 7-day TTL constant', () => {
    expect(REPLAY_TTL_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('has a TTL index on expiresAt', () => {
    // mongoose normalizes `{ index: { expires: 0 } }` to `expireAfterSeconds: 0`
    // in the index options it returns from schema.indexes().
    const indexes: any[] = (Replay as any).schema.indexes();
    const ttlIndex = indexes.find(
      ([fields]) => Object.prototype.hasOwnProperty.call(fields, 'expiresAt'),
    );
    expect(ttlIndex).toBeDefined();
    const [, options] = ttlIndex;
    // The TTL setting may surface under either name depending on mongoose version.
    const ttlSeconds =
      options.expireAfterSeconds !== undefined
        ? options.expireAfterSeconds
        : options.expires;
    expect(ttlSeconds).toBe(0);
  });

  it('indexes gameRecordId for lookup by game record', () => {
    const indexes: any[] = (Replay as any).schema.indexes();
    const ix = indexes.find(([fields]) =>
      Object.prototype.hasOwnProperty.call(fields, 'gameRecordId'),
    );
    expect(ix).toBeDefined();
  });

  /**
   * Regression: player room chat lines (from sockets.ts roomChatFromClient)
   * have no classStr field, so the recorder normalises it to ''. Mongoose's
   * `required: true` on a String rejects empty strings, which previously
   * blocked the entire Replay.create. The schema must accept empty `m`/`c`.
   */
  it('accepts chat lines with empty m / c (player room chat normalisation)', () => {
    const now = new Date();
    const doc = new (Replay as any)({
      schemaVersion: REPLAY_SCHEMA_VERSION,
      expiresAt: new Date(now.getTime() + REPLAY_TTL_MS),
      timeGameStarted: now,
      timeGameFinished: now,
      gameMode: 'avalon',
      anonymousMode: false,
      numberOfPlayers: 5,
      players: [
        { username: 'a', alliance: 'Resistance', role: 'Merlin' },
        { username: 'b', alliance: 'Resistance', role: 'Percival' },
        { username: 'c', alliance: 'Resistance', role: 'Resistance' },
        { username: 'd', alliance: 'Spy', role: 'Assassin' },
        { username: 'e', alliance: 'Spy', role: 'Morgana' },
      ],
      roles: ['Merlin', 'Percival', 'Morgana', 'Assassin'],
      cards: [],
      winner: 'Resistance',
      howTheGameWasWon: '',
      events: [
        { t: 0, k: ReplayEventKind.GameStarted, p: {} },
        {
          t: 1000,
          k: ReplayEventKind.GameFinished,
          p: { winner: 'Resistance' },
        },
      ],
      chat: [
        // Server-emitted text: has classStr.
        { t: 0, m: 'Game started.', c: 'gameplay-text' },
        // Player room chat: no classStr (the failing case from prod).
        { t: 500, m: 'hi', c: '', u: 'a' },
        // Defensive: an empty message should also not block validation.
        { t: 600, m: '', c: '', u: 'b' },
      ],
    });
    const err = doc.validateSync();
    expect(err).toBeUndefined();
  });
});
