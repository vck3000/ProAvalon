/**
 * Replay recorder.
 *
 * One instance per Game. Captures the canonical event timeline + chat as the
 * game plays. The recorder doesn't talk to MongoDB itself — the Game wraps up
 * `finalize()` into a Replay document at game-end alongside GameRecord.create.
 */

import {
  MAX_SNAPSHOTS,
  REPLAY_SCHEMA_VERSION,
  ReplayChatLine,
  ReplayDoc,
  ReplayEvent,
  ReplayEventKind,
  ReplayPlayer,
  ReplaySnapshot,
} from './replayTypes';

/**
 * Fields excluded when comparing consecutive snapshots for dedup.
 * They change on every distributeGameData without representing a
 * meaningful state transition. They ARE kept in the stored snapshot.
 */
const SNAPSHOT_DEDUP_IGNORED_FIELDS = ['dateTimerExpires'];

function dedupKey(g: Record<string, unknown>): string {
  const copy: Record<string, unknown> = { ...g };
  for (const f of SNAPSHOT_DEDUP_IGNORED_FIELDS) {
    delete copy[f];
  }
  return JSON.stringify(copy);
}

/**
 * Whitelist room-players entries to the public fields the client's avatar
 * renderer actually reads (assets/scripts/lobby.js: strOfAvatar, claim and
 * host-star rendering) — getRoomPlayers() output may carry non-public data.
 */
function whitelistRoomPlayers(
  roomPlayers: Array<Record<string, unknown>>,
): Record<string, unknown>[] {
  return roomPlayers.map((rp) => ({
    username: rp.username,
    anonUsername: rp.anonUsername,
    avatarImgRes: rp.avatarImgRes,
    avatarImgSpy: rp.avatarImgSpy,
    avatarHide: rp.avatarHide,
    claim: rp.claim,
    teamLeader: rp.teamLeader,
  }));
}

export interface GameStartMeta {
  startedAt: Date;
  gameMode: string;
  anonymousMode: boolean;
  numberOfPlayers: number;
  players: ReplayPlayer[];
  roles: string[];
  cards: string[];
}

export interface GameFinishMeta {
  finishedAt: Date;
  winner: 'Resistance' | 'Spy';
  howTheGameWasWon: string;
  /** Full role assignments. Only included in the GameFinished event payload. */
  fullRoles: Record<string, { alliance: string; role: string }>;
  /** Final post-anonymizer-reveal player list (anonName included if anonMode). */
  players: ReplayPlayer[];
}

interface RecordedChatInput {
  message: string;
  classStr: string;
  username?: string;
  /** When the message was created. Optional; defaults to getNow(). */
  dateCreated?: Date;
}

export class ReplayRecorder {
  private startedAt: Date | null = null;
  private startMeta: GameStartMeta | null = null;
  private events: ReplayEvent[] = [];
  private chat: ReplayChatLine[] = [];
  private snapshots: ReplaySnapshot[] = [];
  private roomPlayers: Record<string, unknown>[] = [];
  private lastSnapshotKey: string | null = null;
  private lastRoomPlayersKey: string | null = null;
  private lastEventT = 0;
  private lastSnapshotT = 0;
  private snapshotCapWarned = false;
  private finalized = false;

  constructor(private readonly getNow: () => Date = () => new Date()) {}

  /**
   * Begin recording. Pushes the GameStarted event. Anything recorded before
   * `start()` is silently ignored (the game hasn't started yet).
   */
  start(meta: GameStartMeta): void {
    if (this.startedAt) {
      // Idempotent: a Game.start can run multiple times in test setups.
      return;
    }
    // Tolerate an undefined startedAt (some tests don't set it) by stamping
    // the moment start() was called.
    this.startedAt = meta.startedAt
      ? new Date(meta.startedAt)
      : new Date();
    this.startMeta = meta;
    this.recordEvent(ReplayEventKind.GameStarted, {
      gameMode: meta.gameMode,
      anonymousMode: meta.anonymousMode,
      numberOfPlayers: meta.numberOfPlayers,
      // We do NOT include true role/alliance per player here — that's what
      // GameFinished reveals. We include the table-visible "displayRole".
      players: meta.players.map((p) => ({
        username: p.username,
        anonName: p.anonName,
        displayRole: p.displayRole,
        displayAlliance: p.displayAlliance,
      })),
      roles: meta.roles,
      cards: meta.cards,
    });
  }

  /** True once start() has been called. */
  isStarted(): boolean {
    return this.startedAt !== null;
  }

  recordEvent(kind: ReplayEventKind, payload: Record<string, unknown>): void {
    if (!this.startedAt || this.finalized) return;
    this.events.push({
      t: this.monotonicEventT(this.relativeMs()),
      k: kind,
      p: payload,
    });
  }

  /**
   * Record a spectator gameData snapshot. Deep-copies the input (the live
   * game hands us references to arrays it will mutate), dedups against the
   * previous snapshot (ignoring volatile fields like dateTimerExpires), and
   * silently stops at MAX_SNAPSHOTS so a pathological game still finishes
   * with a (degraded) replay rather than an error.
   */
  recordSnapshot(
    g: Record<string, unknown>,
    roomPlayers?: Array<Record<string, unknown>>,
  ): void {
    if (!this.startedAt || this.finalized) return;
    if (!g || typeof g !== 'object') return;

    // Room-players deltas: whitelist, then attach to the next stored
    // snapshot only when the list changed (typically once at start and once
    // at the end-of-game de-anonymization).
    let rpDelta: Record<string, unknown>[] | undefined;
    if (Array.isArray(roomPlayers)) {
      const whitelisted = whitelistRoomPlayers(roomPlayers);
      const rpKey = JSON.stringify(whitelisted);
      if (rpKey !== this.lastRoomPlayersKey) {
        this.lastRoomPlayersKey = rpKey;
        if (this.roomPlayers.length === 0) {
          // First sighting doubles as the top-level initial seating.
          this.roomPlayers = whitelisted;
        } else {
          rpDelta = whitelisted;
        }
      }
    }

    if (this.snapshots.length >= MAX_SNAPSHOTS) {
      if (!this.snapshotCapWarned) {
        this.snapshotCapWarned = true;
        console.log(
          `[Replay] snapshot cap (${MAX_SNAPSHOTS}) reached; further snapshots dropped.`,
        );
      }
      return;
    }

    let copied: Record<string, unknown>;
    try {
      copied = JSON.parse(JSON.stringify(g));
    } catch (e) {
      // Circular reference or similar — never let replay recording break a
      // live game.
      console.log('[Replay] snapshot serialization failed:', e);
      return;
    }

    const key = dedupKey(copied);
    if (key === this.lastSnapshotKey && !rpDelta) {
      return;
    }
    this.lastSnapshotKey = key;

    this.snapshots.push({
      t: this.monotonicSnapshotT(this.relativeMs()),
      g: copied,
      ...(rpDelta ? { rp: rpDelta } : {}),
    });
  }

  /**
   * Record the initial seating list directly (used at game start before the
   * first distribute).
   */
  setRoomPlayers(roomPlayers: Array<Record<string, unknown>>): void {
    if (!Array.isArray(roomPlayers)) return;
    const whitelisted = whitelistRoomPlayers(roomPlayers);
    this.roomPlayers = whitelisted;
    this.lastRoomPlayersKey = JSON.stringify(whitelisted);
  }

  recordChat(line: RecordedChatInput): void {
    if (!this.startedAt || this.finalized) return;
    if (!line || typeof line.message !== 'string') return;
    const tDate = line.dateCreated ?? this.getNow();
    this.chat.push({
      t: tDate.getTime() - this.startedAt.getTime(),
      m: line.message,
      c: typeof line.classStr === 'string' ? line.classStr : '',
      ...(line.username ? { u: line.username } : {}),
    });
  }

  /**
   * Push the GameFinished event and return the full ReplayDoc payload.
   * After finalize the recorder ignores further events.
   */
  finalize(meta: GameFinishMeta): ReplayDoc {
    if (!this.startedAt || !this.startMeta) {
      throw new Error('ReplayRecorder.finalize called before start.');
    }
    if (!this.finalized) {
      // GameFinished payload carries the full role table — view filter
      // strips it under spoiler-free until this event is reached.
      //
      // meta.finishedAt is captured by finishGame BEFORE it records its
      // final PhaseChanged event (game.ts finishGame: timeFinished is taken
      // at entry, then changePhase(Finished) records an event a few ms
      // later). monotonicEventT clamps the stale stamp so the event log
      // keeps its non-decreasing invariant.
      this.events.push({
        t: this.monotonicEventT(this.relativeMs(meta.finishedAt)),
        k: ReplayEventKind.GameFinished,
        p: {
          winner: meta.winner,
          howWon: meta.howTheGameWasWon,
          fullRoles: meta.fullRoles,
        },
      });
      this.finalized = true;
    }

    return {
      schemaVersion: REPLAY_SCHEMA_VERSION,
      timeGameStarted: this.startedAt,
      timeGameFinished: meta.finishedAt,
      gameMode: this.startMeta.gameMode,
      anonymousMode: this.startMeta.anonymousMode,
      numberOfPlayers: this.startMeta.numberOfPlayers,
      players: meta.players,
      roles: this.startMeta.roles,
      cards: this.startMeta.cards,
      winner: meta.winner,
      howTheGameWasWon: meta.howTheGameWasWon,
      events: this.events.slice(),
      chat: this.chat.slice(),
      snapshots: this.snapshots.slice(),
      roomPlayers: this.roomPlayers.slice(),
    };
  }

  // Accessors used by tests.

  getEvents(): ReplayEvent[] {
    return this.events.slice();
  }
  getChat(): ReplayChatLine[] {
    return this.chat.slice();
  }
  getSnapshots(): ReplaySnapshot[] {
    return this.snapshots.slice();
  }
  getRoomPlayers(): Record<string, unknown>[] {
    return this.roomPlayers.slice();
  }

  private relativeMs(now?: Date): number {
    if (!this.startedAt) return 0;
    const candidate = now ?? this.getNow();
    // Defensive: if the time-source returns something that isn't a Date
    // (e.g. an un-stubbed jest.fn() returns undefined), fall back to 0
    // so we don't crash the live game just to write a replay event.
    if (!candidate || typeof (candidate as any).getTime !== 'function') {
      return 0;
    }
    return candidate.getTime() - this.startedAt.getTime();
  }

  /**
   * The validator (and the viewer's chapter seeking) rely on events and
   * snapshots being non-decreasing in t. Wall clocks don't guarantee that
   * (finishGame stamps GameFinished with a Date captured before its last
   * PhaseChanged event; NTP can step the clock mid-game), so each array
   * clamps new timestamps to its own high-water mark at record time.
   */
  private monotonicEventT(t: number): number {
    this.lastEventT = Math.max(t, this.lastEventT);
    return this.lastEventT;
  }

  private monotonicSnapshotT(t: number): number {
    this.lastSnapshotT = Math.max(t, this.lastSnapshotT);
    return this.lastSnapshotT;
  }
}
