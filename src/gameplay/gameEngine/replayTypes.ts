/**
 * Replay system: types and validation.
 *
 * A ReplayDoc is the canonical, self-contained record of one finished game.
 * It is JSON-serializable and the same shape is used:
 *   - on the server, when recording a live game
 *   - in the mongo `replay` collection (TTL 7 days)
 *   - in exported `.json` files users keep locally
 *   - in the React viewer that renders it
 */

export const REPLAY_SCHEMA_VERSION = 2;

/**
 * v2: a snapshot of the spectator-visible game state at time t.
 * `g` is the verbatim (deep-copied) output of getGameDataForSpectators().
 * It is intentionally opaque to validation — its shape tracks the live
 * client contract and will evolve; the replay driver renders best-effort.
 */
export interface ReplaySnapshot {
  /** Milliseconds since the game start. Same clock as events/chat. */
  t: number;
  g: Record<string, unknown>;
  /**
   * Present only when the room-players list changed at this point (e.g. the
   * end-of-game de-anonymization re-emits seatings with real names). The
   * viewer applies the most recent rp at or before the current snapshot,
   * falling back to the top-level roomPlayers.
   */
  rp?: Record<string, unknown>[];
}

export enum ReplayEventKind {
  GameStarted = 'gameStarted',
  PhaseChanged = 'phaseChanged',
  TeamProposed = 'teamProposed',
  VotesRevealed = 'votesRevealed',
  MissionResult = 'missionResult',
  AssassinShot = 'assassinShot',
  MerlinGuess = 'merlinGuess',
  LadyUsed = 'ladyUsed',
  RefUsed = 'refUsed',
  SireUsed = 'sireUsed',
  GameFinished = 'gameFinished',
}

export const REPLAY_EVENT_KINDS: ReadonlySet<string> = new Set(
  Object.values(ReplayEventKind),
);

export interface ReplayEvent {
  /** Milliseconds since the game start. */
  t: number;
  k: ReplayEventKind;
  p: Record<string, unknown>;
}

export interface ReplayChatLine {
  /** Milliseconds since the game start. May be negative for messages that arrived in setup. */
  t: number;
  /** Message text — already length-capped upstream by textLengthFilter. */
  m: string;
  /** Class string used by the client to style the message (e.g. 'gameplay-text'). */
  c: string;
  /** Username (anonymized name during anon games). Server-emitted text has no username. */
  u?: string;
}

export interface ReplayPlayer {
  /** Post-game real username. */
  username: string;
  /** Anon name that was used during play, if the game ran in anonymous mode. */
  anonName?: string;
  alliance: 'Resistance' | 'Spy';
  role: string;
  /** What other players saw at the table (Melron → Merlin, Moregano → Morgana). */
  displayRole?: string;
  /** Display alliance, if different (Moregano shows as Spy alliance). */
  displayAlliance?: string;
}

export interface ReplayDoc {
  schemaVersion: number;
  /** Mongo id of the corresponding gameRecord. Omitted on imported replays. */
  gameRecordId?: string;

  timeGameStarted: string | Date;
  timeGameFinished: string | Date;

  gameMode: string;
  anonymousMode: boolean;
  numberOfPlayers: number;

  /** Players in seat order. */
  players: ReplayPlayer[];

  roles: string[];
  cards: string[];

  winner: 'Resistance' | 'Spy';
  howTheGameWasWon: string;

  events: ReplayEvent[];
  chat: ReplayChatLine[];

  /** v2: spectator gameData timeline driving the room-faithful viewer. */
  snapshots: ReplaySnapshot[];
  /**
   * v2: the room-players list (getRoomPlayers() shape, whitelisted to public
   * fields) recorded once at game start. Seatings are fixed for the game.
   */
  roomPlayers: Record<string, unknown>[];
}

/* ---------------------------------------------------------------------------
 * Validation
 *
 * Used by the React viewer when the user imports a local file, and by the
 * route layer when sanity-checking what came out of Mongo. Intentionally
 * conservative: small payload, reject anything we don't recognise rather than
 * try to repair it.
 * ------------------------------------------------------------------------- */

export interface ValidateResult {
  ok: boolean;
  reason?: string;
}

const MAX_EVENTS = 5_000;
const MAX_CHAT = 5_000;
const MAX_PLAYERS = 10;
const MAX_MESSAGE_LEN = 2_000; // textLengthFilter caps at 500 upstream; allow some slack.
export const MAX_SNAPSHOTS = 2_000;

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

export function validateReplayDoc(input: unknown): ValidateResult {
  if (!isPlainObject(input)) {
    return { ok: false, reason: 'Replay must be an object.' };
  }

  if (input.schemaVersion !== REPLAY_SCHEMA_VERSION) {
    return {
      ok: false,
      reason: `This file is a v${String(
        input.schemaVersion,
      )} replay; only v${REPLAY_SCHEMA_VERSION} is supported.`,
    };
  }

  if (input.winner !== 'Resistance' && input.winner !== 'Spy') {
    return { ok: false, reason: 'Winner must be Resistance or Spy.' };
  }

  if (typeof input.gameMode !== 'string') {
    return { ok: false, reason: 'gameMode must be a string.' };
  }

  if (typeof input.anonymousMode !== 'boolean') {
    return { ok: false, reason: 'anonymousMode must be boolean.' };
  }

  if (
    typeof input.numberOfPlayers !== 'number' ||
    input.numberOfPlayers < 1 ||
    input.numberOfPlayers > MAX_PLAYERS
  ) {
    return { ok: false, reason: 'numberOfPlayers out of range.' };
  }

  if (!Array.isArray(input.players) || input.players.length === 0) {
    return { ok: false, reason: 'players must be a non-empty array.' };
  }
  if (input.players.length !== input.numberOfPlayers) {
    return {
      ok: false,
      reason: 'players.length must equal numberOfPlayers.',
    };
  }
  for (const p of input.players) {
    if (!isPlainObject(p)) {
      return { ok: false, reason: 'Each player must be an object.' };
    }
    if (typeof p.username !== 'string' || typeof p.role !== 'string') {
      return { ok: false, reason: 'Each player needs username and role.' };
    }
    if (p.alliance !== 'Resistance' && p.alliance !== 'Spy') {
      return { ok: false, reason: 'Bad player alliance.' };
    }
  }

  if (!Array.isArray(input.events)) {
    return { ok: false, reason: 'events must be an array.' };
  }
  if (input.events.length > MAX_EVENTS) {
    return { ok: false, reason: `events too long (max ${MAX_EVENTS}).` };
  }
  let prevT = -Infinity;
  for (const e of input.events) {
    if (!isPlainObject(e)) {
      return { ok: false, reason: 'Each event must be an object.' };
    }
    if (typeof e.t !== 'number') {
      return { ok: false, reason: 'event.t must be a number.' };
    }
    if (e.t < prevT) {
      return { ok: false, reason: 'events must be non-decreasing in t.' };
    }
    prevT = e.t;
    if (typeof e.k !== 'string' || !REPLAY_EVENT_KINDS.has(e.k)) {
      return { ok: false, reason: `Unknown event kind: ${String(e.k)}.` };
    }
    if (!isPlainObject(e.p)) {
      return { ok: false, reason: 'event.p must be an object.' };
    }
  }

  if (!Array.isArray(input.chat)) {
    return { ok: false, reason: 'chat must be an array.' };
  }
  if (input.chat.length > MAX_CHAT) {
    return { ok: false, reason: `chat too long (max ${MAX_CHAT}).` };
  }
  for (const c of input.chat) {
    if (!isPlainObject(c)) {
      return { ok: false, reason: 'Each chat line must be an object.' };
    }
    if (typeof c.t !== 'number') {
      return { ok: false, reason: 'chat.t must be a number.' };
    }
    if (typeof c.m !== 'string' || c.m.length > MAX_MESSAGE_LEN) {
      return { ok: false, reason: 'chat.m must be a short string.' };
    }
    if (typeof c.c !== 'string') {
      return { ok: false, reason: 'chat.c must be a string.' };
    }
    if (c.u !== undefined && typeof c.u !== 'string') {
      return { ok: false, reason: 'chat.u must be a string when present.' };
    }
  }

  // v2: snapshots timeline.
  if (!Array.isArray(input.snapshots) || input.snapshots.length === 0) {
    return { ok: false, reason: 'snapshots must be a non-empty array.' };
  }
  if (input.snapshots.length > MAX_SNAPSHOTS) {
    return {
      ok: false,
      reason: `snapshots too long (max ${MAX_SNAPSHOTS}).`,
    };
  }
  let prevSnapT = -Infinity;
  for (const s of input.snapshots) {
    if (!isPlainObject(s)) {
      return { ok: false, reason: 'Each snapshot must be an object.' };
    }
    if (typeof s.t !== 'number') {
      return { ok: false, reason: 'snapshot.t must be a number.' };
    }
    if (s.t < prevSnapT) {
      return { ok: false, reason: 'snapshots must be non-decreasing in t.' };
    }
    prevSnapT = s.t;
    if (!isPlainObject(s.g)) {
      return { ok: false, reason: 'snapshot.g must be an object.' };
    }
    if (s.rp !== undefined) {
      if (!Array.isArray(s.rp)) {
        return { ok: false, reason: 'snapshot.rp must be an array.' };
      }
      for (const rp of s.rp) {
        if (!isPlainObject(rp)) {
          return { ok: false, reason: 'snapshot.rp entries must be objects.' };
        }
      }
    }
    // g is intentionally NOT deep-validated: its shape tracks the live
    // spectator gameData contract. The driver renders best-effort.
  }

  // v2: roomPlayers seating list.
  if (!Array.isArray(input.roomPlayers) || input.roomPlayers.length === 0) {
    return { ok: false, reason: 'roomPlayers must be a non-empty array.' };
  }
  if (input.roomPlayers.length !== input.numberOfPlayers) {
    return {
      ok: false,
      reason: 'roomPlayers.length must equal numberOfPlayers.',
    };
  }
  for (const rp of input.roomPlayers) {
    if (!isPlainObject(rp) || typeof rp.username !== 'string') {
      return {
        ok: false,
        reason: 'Each roomPlayer must be an object with a username.',
      };
    }
  }

  // At least one GameStarted event must lead, GameFinished must close the timeline.
  if (input.events.length > 0) {
    const first = input.events[0] as ReplayEvent;
    const last = input.events[input.events.length - 1] as ReplayEvent;
    if (first.k !== ReplayEventKind.GameStarted) {
      return { ok: false, reason: 'First event must be GameStarted.' };
    }
    if (last.k !== ReplayEventKind.GameFinished) {
      return { ok: false, reason: 'Last event must be GameFinished.' };
    }
  }

  return { ok: true };
}
