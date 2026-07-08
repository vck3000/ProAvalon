import { ReplayRecorder } from '../replayRecorder';
import {
  MAX_SNAPSHOTS,
  ReplayEventKind,
  validateReplayDoc,
} from '../replayTypes';

function startedRecorder(times: number[]): ReplayRecorder {
  let i = 0;
  const rec = new ReplayRecorder(() => new Date(1000 + (times[i++] ?? 0)));
  rec.start({
    startedAt: new Date(1000),
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
    roles: [],
    cards: [],
  });
  return rec;
}

describe('ReplayRecorder snapshots', () => {
  it('deep-copies snapshots so later mutation of the source is not visible', () => {
    const rec = startedRecorder([0, 10]);
    const g: any = { phase: 'pickingTeam', missionHistory: [] };
    rec.recordSnapshot(g);
    g.phase = 'finished';
    g.missionHistory.push('succeeded');
    const snaps = rec.getSnapshots();
    expect(snaps).toHaveLength(1);
    expect(snaps[0].g.phase).toBe('pickingTeam');
    expect(snaps[0].g.missionHistory).toEqual([]);
  });

  it('dedups consecutive identical snapshots, ignoring dateTimerExpires', () => {
    const rec = startedRecorder([0, 10, 20, 30]);
    rec.recordSnapshot({ phase: 'pickingTeam', dateTimerExpires: 111 });
    rec.recordSnapshot({ phase: 'pickingTeam', dateTimerExpires: 222 });
    rec.recordSnapshot({ phase: 'votingTeam', dateTimerExpires: 222 });
    expect(rec.getSnapshots().map((s) => s.g.phase)).toEqual([
      'pickingTeam',
      'votingTeam',
    ]);
  });

  it('does not dedup non-consecutive repeats (A B A is three snapshots)', () => {
    const rec = startedRecorder([0, 10, 20]);
    rec.recordSnapshot({ phase: 'A' });
    rec.recordSnapshot({ phase: 'B' });
    rec.recordSnapshot({ phase: 'A' });
    expect(rec.getSnapshots()).toHaveLength(3);
  });

  it('stops recording at MAX_SNAPSHOTS without throwing', () => {
    const times = Array.from({ length: MAX_SNAPSHOTS + 10 }, (_, i) => i);
    const rec = startedRecorder(times);
    for (let i = 0; i < MAX_SNAPSHOTS + 10; i++) {
      rec.recordSnapshot({ n: i });
    }
    expect(rec.getSnapshots()).toHaveLength(MAX_SNAPSHOTS);
  });

  it('snapshot t values are non-decreasing and relative to game start', () => {
    // First value is consumed by start()'s GameStarted event.
    const rec = startedRecorder([0, 5, 50, 500]);
    rec.recordSnapshot({ n: 1 });
    rec.recordSnapshot({ n: 2 });
    rec.recordSnapshot({ n: 3 });
    const ts = rec.getSnapshots().map((s) => s.t);
    expect(ts).toEqual([5, 50, 500]);
    expect(ts.every((t, i) => i === 0 || t >= ts[i - 1])).toBe(true);
  });

  it('ignores snapshots before start and after finalize', () => {
    const rec = new ReplayRecorder(() => new Date(1000));
    rec.recordSnapshot({ tooEarly: true });
    expect(rec.getSnapshots()).toHaveLength(0);

    const started = startedRecorder([0, 10]);
    started.recordSnapshot({ phase: 'pickingTeam' });
    started.finalize({
      finishedAt: new Date(2000),
      winner: 'Resistance',
      howTheGameWasWon: 'x',
      fullRoles: {},
      players: [
        { username: 'a', alliance: 'Resistance', role: 'Merlin' },
        { username: 'b', alliance: 'Resistance', role: 'Percival' },
        { username: 'c', alliance: 'Resistance', role: 'Resistance' },
        { username: 'd', alliance: 'Spy', role: 'Assassin' },
        { username: 'e', alliance: 'Spy', role: 'Morgana' },
      ],
    });
    started.recordSnapshot({ tooLate: true });
    expect(started.getSnapshots()).toHaveLength(1);
  });

  it('clamps a stale finishedAt below the last event (finishGame ordering)', () => {
    // Reproduces the production finishGame flow: timeFinished is captured
    // at entry, then changePhase(Finished) records a PhaseChanged event a
    // few ms later, and finalize() receives the stale timeFinished. Without
    // clamping, GameFinished lands last in the array with a smaller t and
    // validation rejects the whole replay.
    const start = 1000;
    const rec = startedRecorder([0, 60]); // GameStarted t=0, PhaseChanged t=60
    rec.setRoomPlayers([
      { username: 'a' },
      { username: 'b' },
      { username: 'c' },
      { username: 'd' },
      { username: 'e' },
    ]);
    rec.recordSnapshot({ phase: 'Finished' });
    rec.recordEvent(ReplayEventKind.PhaseChanged, { phase: 'Finished' });
    const doc = rec.finalize({
      finishedAt: new Date(start + 50), // stale: before the last event
      winner: 'Resistance',
      howTheGameWasWon: 'x',
      fullRoles: {},
      players: [
        { username: 'a', alliance: 'Resistance', role: 'Merlin' },
        { username: 'b', alliance: 'Resistance', role: 'Percival' },
        { username: 'c', alliance: 'Resistance', role: 'Resistance' },
        { username: 'd', alliance: 'Spy', role: 'Assassin' },
        { username: 'e', alliance: 'Spy', role: 'Morgana' },
      ],
    });
    const last = doc.events[doc.events.length - 1];
    const secondLast = doc.events[doc.events.length - 2];
    expect(last.k).toBe(ReplayEventKind.GameFinished);
    expect(last.t).toBeGreaterThanOrEqual(secondLast.t);
    expect(validateReplayDoc(JSON.parse(JSON.stringify(doc)))).toEqual({
      ok: true,
    });
  });

  it('clamps events and snapshots against wall-clock steps backwards', () => {
    // NTP corrections can step the clock backwards mid-game.
    const rec = startedRecorder([0, 500, 300, 900]);
    rec.recordEvent(ReplayEventKind.TeamProposed, {});
    rec.recordEvent(ReplayEventKind.VotesRevealed, {}); // clock stepped back to 300
    rec.recordEvent(ReplayEventKind.MissionResult, {});
    const ts = rec.getEvents().map((e) => e.t);
    // GameStarted 0, then 500, clamped 500, then 900.
    expect(ts).toEqual([0, 500, 500, 900]);

    const rec2 = startedRecorder([0, 500, 300]);
    rec2.recordSnapshot({ n: 1 });
    rec2.recordSnapshot({ n: 2 });
    expect(rec2.getSnapshots().map((s) => s.t)).toEqual([500, 500]);
  });

  it('setRoomPlayers whitelists to public renderer fields', () => {
    const rec = startedRecorder([0]);
    rec.setRoomPlayers([
      {
        username: 'a',
        anonUsername: 'Pikachu',
        avatarImgRes: 'res.png',
        avatarImgSpy: 'spy.png',
        avatarHide: false,
        claim: true,
        teamLeader: true,
        secretModFlag: 'DO_NOT_LEAK',
        ipAddress: '10.0.0.1',
      },
    ]);
    const rp = rec.getRoomPlayers();
    expect(rp[0]).toEqual({
      username: 'a',
      anonUsername: 'Pikachu',
      avatarImgRes: 'res.png',
      avatarImgSpy: 'spy.png',
      avatarHide: false,
      claim: true,
      teamLeader: true,
    });
    expect((rp[0] as any).secretModFlag).toBeUndefined();
    expect((rp[0] as any).ipAddress).toBeUndefined();
  });

  it('finalized doc with snapshots and roomPlayers passes validateReplayDoc', () => {
    const rec = startedRecorder([0, 10, 20]);
    rec.setRoomPlayers([
      { username: 'a' },
      { username: 'b' },
      { username: 'c' },
      { username: 'd' },
      { username: 'e' },
    ]);
    rec.recordSnapshot({ phase: 'pickingTeam' });
    rec.recordSnapshot({ phase: 'finished' });
    const doc = rec.finalize({
      finishedAt: new Date(2000),
      winner: 'Resistance',
      howTheGameWasWon: 'Three missions succeeded.',
      fullRoles: {},
      players: [
        { username: 'a', alliance: 'Resistance', role: 'Merlin' },
        { username: 'b', alliance: 'Resistance', role: 'Percival' },
        { username: 'c', alliance: 'Resistance', role: 'Resistance' },
        { username: 'd', alliance: 'Spy', role: 'Assassin' },
        { username: 'e', alliance: 'Spy', role: 'Morgana' },
      ],
    });
    const parsed = JSON.parse(JSON.stringify(doc));
    const result = validateReplayDoc(parsed);
    expect(result).toEqual({ ok: true });
    expect(parsed.snapshots).toHaveLength(2);
    expect(parsed.roomPlayers).toHaveLength(5);
  });
});
