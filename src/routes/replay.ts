/**
 * Replay viewer + export routes.
 *
 * All routes are mounted at `/replay`, AFTER the `isLoggedIn` middleware in
 * app.ts, so anonymous traffic redirects to login (matches `/lobby` etc.).
 *
 * - GET /replay/import           — Render the viewer with no pre-seeded data.
 *                                  The React component shows a file-picker;
 *                                  the user's file never leaves the browser.
 * - GET /replay/:id              — Render the viewer with the replay
 *                                  pre-seeded via window.__REPLAY__.
 * - GET /replay/:id.json         — Replay JSON (for client refetch).
 * - GET /replay/:id/export       — Same JSON but with a Content-Disposition
 *                                  attachment filename for download.
 *
 * Replays are auto-reaped after 7 days by a MongoDB TTL index, so 404 here
 * is the expected long-term outcome.
 */

import { Router } from 'express';
import mongoose from 'mongoose';

import Replay from '../models/replay';

const router = Router();

/** Convert a Replay mongoose doc to the public ReplayDoc shape. */
function toReplayDoc(replay: any) {
  return {
    schemaVersion: replay.schemaVersion,
    gameRecordId: replay.gameRecordId
      ? String(replay.gameRecordId)
      : undefined,
    timeGameStarted: replay.timeGameStarted,
    timeGameFinished: replay.timeGameFinished,
    gameMode: replay.gameMode,
    anonymousMode: replay.anonymousMode,
    numberOfPlayers: replay.numberOfPlayers,
    players: (replay.players || []).map((p: any) => ({
      username: p.username,
      anonName: p.anonName,
      alliance: p.alliance,
      role: p.role,
      displayRole: p.displayRole,
      displayAlliance: p.displayAlliance,
    })),
    roles: replay.roles || [],
    cards: replay.cards || [],
    winner: replay.winner,
    howTheGameWasWon: replay.howTheGameWasWon,
    events: (replay.events || []).map((e: any) => ({
      t: e.t,
      k: e.k,
      p: e.p,
    })),
    chat: (replay.chat || []).map((c: any) => ({
      t: c.t,
      m: c.m,
      c: c.c,
      ...(c.u ? { u: c.u } : {}),
    })),
    snapshots: (replay.snapshots || []).map((s: any) => ({
      t: s.t,
      g: s.g,
      ...(s.rp ? { rp: s.rp } : {}),
    })),
    roomPlayers: replay.roomPlayers || [],
  };
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Look up by gameRecordId (what the lobby chat link uses). If `id` happens
 * to be a Replay _id rather than a gameRecordId, fall through to that lookup
 * — gives users a chance to share either id form.
 */
export async function findReplay(id: string) {
  if (!isValidObjectId(id)) {
    return null;
  }
  let doc = await Replay.findOne({ gameRecordId: id });
  if (!doc) {
    doc = await Replay.findById(id);
  }
  return doc;
}

/** How many replays to show on the index page. The collection is TTL-bounded
 *  to a rolling 7-day window so this is mostly a UI cap, not a storage one. */
const REPLAY_LIST_LIMIT = 50;

// List recent replays. Any logged-in user can see any replay.
router.get('/', async (req, res) => {
  try {
    const replays = await Replay.find(
      {},
      {
        gameRecordId: 1,
        timeGameFinished: 1,
        gameMode: 1,
        numberOfPlayers: 1,
        winner: 1,
        howTheGameWasWon: 1,
        anonymousMode: 1,
        players: 1,
      },
    )
      .sort({ timeGameFinished: -1 })
      .limit(REPLAY_LIST_LIMIT)
      .lean();

    const rows = replays.map((r: any) => ({
      id: String(r.gameRecordId || r._id),
      timeGameFinished: r.timeGameFinished,
      gameMode: r.gameMode || 'avalon',
      numberOfPlayers: r.numberOfPlayers || (r.players ? r.players.length : 0),
      winner: r.winner || '',
      howTheGameWasWon: r.howTheGameWasWon || '',
      anonymousMode: !!r.anonymousMode,
      players: Array.isArray(r.players)
        ? r.players.map((p: any) => p.username)
        : [],
    }));

    return res.render('replayList', {
      headerActive: 'replays',
      replays: rows,
      limit: REPLAY_LIST_LIMIT,
    });
  } catch (e) {
    console.log('[Replay] /replay (list) error', e);
    return res.status(500).send('Server error.');
  }
});

// Render: file-import mode (no pre-seeded data).
router.get('/import', (req, res) => {
  res.render('replayRoom', {
    headerActive: 'replays',
    replayJson: 'null',
    gameRecordId: '',
    // Locals the shared gameRoom partial expects; the react bundles that
    // hydrate these aren't loaded in replay mode.
    reportsReact: '',
    matchmakingReact: '',
  });
});

// JSON fetch (used by the bundle if needed for refetch).
router.get('/:id.json', async (req, res) => {
  try {
    const replay = await findReplay(req.params.id);
    if (!replay) {
      return res.status(404).json({ error: 'Replay not found or expired.' });
    }
    return res.json(toReplayDoc(replay));
  } catch (e) {
    console.log('[Replay] /replay/:id.json error', e);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// Export: JSON with attachment headers so browsers download a file.
router.get('/:id/export', async (req, res) => {
  try {
    const replay = await findReplay(req.params.id);
    if (!replay) {
      return res
        .status(404)
        .send('Replay not found or expired. Try importing a locally saved copy.');
    }
    const doc = toReplayDoc(replay);
    const id = doc.gameRecordId || req.params.id;
    res.attachment(`proavalon-replay-${id}.json`);
    res.type('application/json');
    return res.send(JSON.stringify(doc, null, 2));
  } catch (e) {
    console.log('[Replay] /replay/:id/export error', e);
    return res.status(500).send('Server error.');
  }
});

// Render: viewer with replay pre-seeded.
router.get('/:id', async (req, res) => {
  try {
    const replay = await findReplay(req.params.id);
    if (!replay) {
      return res.status(404).render('simpleText', {
        contents:
          'This replay was not found or has expired. Replays are kept for 7 days. ' +
          'Use /replay/import to load a locally exported copy.',
      });
    }
    const doc = toReplayDoc(replay);
    return res.render('replayRoom', {
      headerActive: 'replays',
      // Inlined as a JS literal in the EJS via <%- %>. JSON is a strict
      // subset of JS literals, so this is safe to drop into a <script> body
      // — but escape `<` so user chat can't close the script tag.
      replayJson: JSON.stringify(doc).replace(/</g, '\\u003c'),
      gameRecordId: doc.gameRecordId || req.params.id,
      reportsReact: '',
      matchmakingReact: '',
    });
  } catch (e) {
    console.log('[Replay] /replay/:id error', e);
    return res.status(500).send('Server error.');
  }
});

export default router;
