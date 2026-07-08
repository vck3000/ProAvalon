import mongoose from 'mongoose';

/**
 * Replay storage.
 *
 * Each document is one game's full replay. A TTL index on `expiresAt` (with
 * `expires: 0`) has MongoDB's TTL monitor auto-delete each doc the moment
 * `Date.now() > expiresAt`. We default `expiresAt = timeGameFinished + 7 days`,
 * so server storage stays bounded to a rolling 7-day window.
 *
 * Long-term archival is the user's responsibility via the JSON export in the
 * replay viewer. The same shape (minus mongo-managed fields) is what gets
 * downloaded and is what `validateReplayDoc` accepts on import.
 */

const replayPlayerSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    anonName: String,
    alliance: { type: String, required: true },
    role: { type: String, required: true },
    displayRole: String,
    displayAlliance: String,
  },
  { _id: false },
);

const replayEventSchema = new mongoose.Schema(
  {
    t: { type: Number, required: true },
    k: { type: String, required: true },
    p: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const replayChatSchema = new mongoose.Schema(
  {
    t: { type: Number, required: true },
    // `m` and `c` are intentionally NOT `required: true`: mongoose's required
    // string validator rejects empty strings too, and player room chat lines
    // arrive without a classStr (so `c` is ''). The recorder and
    // validateReplayDoc enforce shape — the storage schema just records what
    // actually happened.
    m: { type: String, default: '' },
    c: { type: String, default: '' },
    u: String,
  },
  { _id: false },
);

const replaySnapshotSchema = new mongoose.Schema(
  {
    t: { type: Number, required: true },
    // Verbatim spectator gameData; opaque by design (see replayTypes.ts).
    g: { type: mongoose.Schema.Types.Mixed, default: {} },
    // Room-players delta, present only when the seating display changed.
    rp: { type: [mongoose.Schema.Types.Mixed], default: undefined },
  },
  { _id: false, minimize: false },
);

const replaySchema = new mongoose.Schema({
  gameRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'gameRecord',
    index: true,
  },
  schemaVersion: { type: Number, required: true },

  // TTL: doc reaped at expiresAt.
  expiresAt: { type: Date, required: true, index: { expires: 0 } },

  timeGameStarted: Date,
  timeGameFinished: Date,

  gameMode: String,
  anonymousMode: Boolean,
  numberOfPlayers: Number,

  players: [replayPlayerSchema],
  roles: [String],
  cards: [String],

  winner: String,
  howTheGameWasWon: String,

  events: [replayEventSchema],
  chat: [replayChatSchema],

  // v2: spectator gameData timeline + fixed seating list.
  snapshots: [replaySnapshotSchema],
  roomPlayers: [mongoose.Schema.Types.Mixed],
});

export const REPLAY_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const Replay = mongoose.model('replay', replaySchema);

export default Replay;
