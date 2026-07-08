import { ReplayRecorder } from '../replayRecorder';
import {
  REPLAY_SCHEMA_VERSION,
  ReplayEventKind,
} from '../replayTypes';

function makeRecorder(times: Date[]) {
  let i = 0;
  const getNow = jest.fn(() => {
    const t = times[Math.min(i, times.length - 1)];
    i += 1;
    return t;
  });
  return new ReplayRecorder(getNow);
}

describe('ReplayRecorder', () => {
  const start = new Date('2026-01-01T00:00:00.000Z');
  const t1s = new Date(start.getTime() + 1000);
  const t2s = new Date(start.getTime() + 2000);
  const t3s = new Date(start.getTime() + 3000);
  const t5s = new Date(start.getTime() + 5000);

  it('ignores events recorded before start()', () => {
    const r = new ReplayRecorder(() => start);
    r.recordEvent(ReplayEventKind.PhaseChanged, { phase: 'PickingTeam' });
    r.recordChat({ message: 'hello', classStr: 'gameplay-text' });
    expect(r.getEvents()).toEqual([]);
    expect(r.getChat()).toEqual([]);
  });

  it('records GameStarted on start()', () => {
    const r = new ReplayRecorder(() => start);
    r.start({
      startedAt: start,
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
    });

    const events = r.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].k).toBe(ReplayEventKind.GameStarted);
    expect(events[0].t).toBe(0);
    // GameStarted must NOT include true roles in its payload — only the
    // table-visible displayRole.
    const ps = (events[0].p.players as any[]);
    expect(ps[0]).not.toHaveProperty('role');
    expect(ps[0]).not.toHaveProperty('alliance');
  });

  it('timestamps events with ms since start', () => {
    const r = makeRecorder([start, t1s, t2s, t3s]); // start, phase, chat, finalize
    r.start({
      startedAt: start,
      gameMode: 'avalon',
      anonymousMode: false,
      numberOfPlayers: 5,
      players: [],
      roles: [],
      cards: [],
    });
    r.recordEvent(ReplayEventKind.PhaseChanged, { phase: 'VotingTeam' });
    r.recordChat({ message: 'hi', classStr: 'all-chat-text' });
    const doc = r.finalize({
      finishedAt: t5s,
      winner: 'Resistance',
      howTheGameWasWon: 'Three missions succeeded.',
      fullRoles: {},
      players: [],
    });

    expect(doc.schemaVersion).toBe(REPLAY_SCHEMA_VERSION);
    expect(doc.events[0].t).toBe(0); // GameStarted
    expect(doc.events[1].t).toBe(1000); // PhaseChanged at +1s
    expect(doc.events[doc.events.length - 1].k).toBe(
      ReplayEventKind.GameFinished,
    );
    expect(doc.events[doc.events.length - 1].t).toBe(5000);

    expect(doc.chat).toHaveLength(1);
    expect(doc.chat[0].t).toBe(2000);
    expect(doc.chat[0].m).toBe('hi');
  });

  it('records chat with explicit dateCreated rather than getNow', () => {
    const r = new ReplayRecorder(() => start);
    r.start({
      startedAt: start,
      gameMode: 'avalon',
      anonymousMode: false,
      numberOfPlayers: 5,
      players: [],
      roles: [],
      cards: [],
    });
    r.recordChat({
      message: 'hello',
      classStr: 'all-chat-text',
      username: 'alice',
      dateCreated: t3s,
    });
    expect(r.getChat()).toEqual([
      { t: 3000, m: 'hello', c: 'all-chat-text', u: 'alice' },
    ]);
  });

  it('ignores events recorded after finalize()', () => {
    const r = makeRecorder([start, t1s, t5s, t5s]);
    r.start({
      startedAt: start,
      gameMode: 'avalon',
      anonymousMode: false,
      numberOfPlayers: 5,
      players: [],
      roles: [],
      cards: [],
    });
    r.finalize({
      finishedAt: t5s,
      winner: 'Spy',
      howTheGameWasWon: 'Three missions failed.',
      fullRoles: {},
      players: [],
    });
    const eventsBefore = r.getEvents().length;
    r.recordEvent(ReplayEventKind.PhaseChanged, { phase: 'PickingTeam' });
    r.recordChat({ message: 'late', classStr: 'all-chat-text' });
    expect(r.getEvents().length).toBe(eventsBefore);
    expect(r.getChat()).toEqual([]);
  });

  it('events are monotonic non-decreasing in t', () => {
    const r = makeRecorder([
      start,
      t1s,
      t2s,
      t3s, // events occurring at later times
    ]);
    r.start({
      startedAt: start,
      gameMode: 'avalon',
      anonymousMode: false,
      numberOfPlayers: 5,
      players: [],
      roles: [],
      cards: [],
    });
    r.recordEvent(ReplayEventKind.PhaseChanged, { phase: 'VotingTeam' });
    r.recordEvent(ReplayEventKind.PhaseChanged, { phase: 'VotingMission' });
    const doc = r.finalize({
      finishedAt: t5s,
      winner: 'Resistance',
      howTheGameWasWon: '',
      fullRoles: {},
      players: [],
    });
    let prev = -Infinity;
    for (const e of doc.events) {
      expect(e.t).toBeGreaterThanOrEqual(prev);
      prev = e.t;
    }
  });
});
