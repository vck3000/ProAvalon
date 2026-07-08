import {
  REPLAY_SCHEMA_VERSION,
  ReplayDoc,
  ReplayEventKind,
  validateReplayDoc,
} from '../replayTypes';

function makeValid(): ReplayDoc {
  return {
    schemaVersion: REPLAY_SCHEMA_VERSION,
    timeGameStarted: '2026-01-01T00:00:00.000Z',
    timeGameFinished: '2026-01-01T00:30:00.000Z',
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
    howTheGameWasWon: 'Three missions succeeded.',
    events: [
      { t: 0, k: ReplayEventKind.GameStarted, p: { numberOfPlayers: 5 } },
      {
        t: 100,
        k: ReplayEventKind.GameFinished,
        p: { winner: 'Resistance' },
      },
    ],
    chat: [{ t: 50, m: 'gg', c: 'all-chat-text', u: 'a' }],
    snapshots: [
      { t: 0, g: { phase: 'pickingTeam', missionNum: 1 } },
      { t: 100, g: { phase: 'finished', winner: 'Resistance' } },
    ],
    roomPlayers: [
      { username: 'a' },
      { username: 'b' },
      { username: 'c' },
      { username: 'd' },
      { username: 'e' },
    ],
  };
}

describe('validateReplayDoc', () => {
  it('accepts a well-formed doc', () => {
    expect(validateReplayDoc(makeValid()).ok).toBe(true);
  });

  it('survives JSON round-trip', () => {
    const doc = makeValid();
    const parsed = JSON.parse(JSON.stringify(doc));
    expect(validateReplayDoc(parsed).ok).toBe(true);
  });

  it('rejects non-objects', () => {
    expect(validateReplayDoc(null).ok).toBe(false);
    expect(validateReplayDoc(42).ok).toBe(false);
    expect(validateReplayDoc([]).ok).toBe(false);
  });

  it('rejects bad schemaVersion', () => {
    const doc = makeValid();
    (doc as any).schemaVersion = 999;
    const r = validateReplayDoc(doc);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/v999 replay; only v2 is supported/);
  });

  it('rejects bad winner', () => {
    const doc = makeValid();
    (doc as any).winner = 'Aliens';
    expect(validateReplayDoc(doc).ok).toBe(false);
  });

  it('rejects players.length mismatch', () => {
    const doc = makeValid();
    doc.players.pop();
    expect(validateReplayDoc(doc).ok).toBe(false);
  });

  it('rejects unknown event kinds', () => {
    const doc = makeValid();
    (doc.events[0] as any).k = 'definitely-not-a-real-event';
    const r = validateReplayDoc(doc);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/Unknown event kind/);
  });

  it('rejects events out of time order', () => {
    const doc = makeValid();
    doc.events = [
      { t: 100, k: ReplayEventKind.GameStarted, p: {} },
      { t: 50, k: ReplayEventKind.PhaseChanged, p: { phase: 'VotingTeam' } },
      { t: 200, k: ReplayEventKind.GameFinished, p: { winner: 'Spy' } },
    ];
    const r = validateReplayDoc(doc);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/non-decreasing/);
  });

  it('rejects a timeline that does not start with GameStarted', () => {
    const doc = makeValid();
    doc.events[0].k = ReplayEventKind.PhaseChanged;
    doc.events[0].p = { phase: 'PickingTeam' };
    const r = validateReplayDoc(doc);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/GameStarted/);
  });

  it('rejects a timeline that does not end with GameFinished', () => {
    const doc = makeValid();
    doc.events[doc.events.length - 1].k = ReplayEventKind.PhaseChanged;
    doc.events[doc.events.length - 1].p = { phase: 'PickingTeam' };
    const r = validateReplayDoc(doc);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/GameFinished/);
  });

  it('rejects oversize chat messages', () => {
    const doc = makeValid();
    doc.chat.push({
      t: 60,
      m: 'x'.repeat(2_001),
      c: 'all-chat-text',
      u: 'a',
    });
    expect(validateReplayDoc(doc).ok).toBe(false);
  });

  it('rejects too many events', () => {
    const doc = makeValid();
    const start = { t: 0, k: ReplayEventKind.GameStarted, p: {} };
    const end = {
      t: 6000,
      k: ReplayEventKind.GameFinished,
      p: { winner: 'Spy' },
    };
    const middle = Array.from({ length: 5_001 }, (_, i) => ({
      t: i + 1,
      k: ReplayEventKind.PhaseChanged,
      p: { phase: 'PickingTeam' },
    }));
    doc.events = [start, ...middle, end] as any;
    expect(validateReplayDoc(doc).ok).toBe(false);
  });
});
