/**
 * Replay route tests.
 *
 * Routes are exercised by handing the express router a manually-constructed
 * request, request-recorder response, and a mocked Replay model. This keeps
 * the test dependency-light (no supertest in the repo) while still verifying
 * the full handler behaviour.
 */

jest.mock('../models/replay', () => {
  const findOne = jest.fn();
  const findById = jest.fn();
  // The listing route does `Replay.find({...}, projection).sort().limit().lean()`.
  // The mock returns a chainable cursor whose terminal .lean() resolves to
  // whatever the test populated via __setListResult.
  let listResult: unknown[] = [];
  const cursor: any = {
    sort: () => cursor,
    limit: () => cursor,
    lean: () => Promise.resolve(listResult),
  };
  const find = jest.fn(() => cursor);

  function MockReplay() {
    /* not used */
  }
  (MockReplay as any).findOne = findOne;
  (MockReplay as any).findById = findById;
  (MockReplay as any).find = find;
  (MockReplay as any).__setListResult = (rows: unknown[]) => {
    listResult = rows;
  };
  return {
    __esModule: true,
    default: MockReplay,
    REPLAY_TTL_MS: 7 * 24 * 60 * 60 * 1000,
  };
});

import Replay from '../models/replay';
import replayRouter from '../routes/replay';
import { REPLAY_SCHEMA_VERSION, ReplayEventKind } from '../gameplay/gameEngine/replayTypes';

const VALID_OBJECT_ID = '507f1f77bcf86cd799439011';

interface RecRes {
  statusCode: number;
  headers: Record<string, string | undefined>;
  body: unknown;
  type?: string;
  rendered?: { template: string; locals: Record<string, unknown> };
}

function mockRes(): RecRes & {
  status: (n: number) => RecRes & any;
  json: (b: unknown) => RecRes & any;
  send: (b: unknown) => RecRes & any;
  render: (t: string, locals: Record<string, unknown>) => RecRes & any;
  attachment: (f: string) => RecRes & any;
  type: (t: string) => RecRes & any;
  setHeader: (k: string, v: string) => RecRes & any;
} {
  const rec: any = {
    statusCode: 200,
    headers: {},
    body: undefined,
  };
  rec.status = (n: number) => {
    rec.statusCode = n;
    return rec;
  };
  rec.json = (b: unknown) => {
    rec.body = b;
    return rec;
  };
  rec.send = (b: unknown) => {
    rec.body = b;
    return rec;
  };
  rec.render = (template: string, locals: Record<string, unknown>) => {
    rec.rendered = { template, locals };
    return rec;
  };
  rec.attachment = (filename: string) => {
    rec.headers['Content-Disposition'] = `attachment; filename="${filename}"`;
    return rec;
  };
  rec.type = (t: string) => {
    rec.type = t;
    return rec;
  };
  rec.setHeader = (k: string, v: string) => {
    rec.headers[k] = v;
    return rec;
  };
  return rec;
}

/**
 * Find an express route handler in the router for a given method + path.
 * Express stores routes on `router.stack`, each layer with a `route` having
 * `path` and `stack` (method handlers).
 */
function findRouteHandler(
  method: string,
  path: string,
): (req: any, res: any, next: any) => any {
  const stack = (replayRouter as any).stack as any[];
  for (const layer of stack) {
    if (!layer.route) continue;
    if (layer.route.path !== path) continue;
    for (const subLayer of layer.route.stack) {
      if (subLayer.method === method.toLowerCase()) {
        return subLayer.handle;
      }
    }
  }
  throw new Error(`No handler for ${method} ${path}`);
}

function dbReplay() {
  return {
    _id: VALID_OBJECT_ID,
    gameRecordId: VALID_OBJECT_ID,
    schemaVersion: REPLAY_SCHEMA_VERSION,
    timeGameStarted: new Date('2026-01-01T00:00:00.000Z'),
    timeGameFinished: new Date('2026-01-01T00:30:00.000Z'),
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
    cards: [] as string[],
    winner: 'Resistance',
    howTheGameWasWon: 'Three missions succeeded.',
    events: [
      { t: 0, k: ReplayEventKind.GameStarted, p: { numberOfPlayers: 5 } },
      {
        t: 1000,
        k: ReplayEventKind.GameFinished,
        p: { winner: 'Resistance' },
      },
    ],
    chat: [] as Array<{ t: number; m: string; c: string; u?: string }>,
  };
}

describe('replay routes', () => {
  beforeEach(() => {
    (Replay as any).findOne.mockReset();
    (Replay as any).findById.mockReset();
  });

  describe('GET /:id.json', () => {
    it('returns 404 when no doc found', async () => {
      (Replay as any).findOne.mockResolvedValue(null);
      (Replay as any).findById.mockResolvedValue(null);
      const handler = findRouteHandler('get', '/:id.json');
      const res = mockRes();
      await handler({ params: { id: VALID_OBJECT_ID } }, res, jest.fn());
      expect(res.statusCode).toBe(404);
    });

    it('returns the doc when found', async () => {
      (Replay as any).findOne.mockResolvedValue(dbReplay());
      const handler = findRouteHandler('get', '/:id.json');
      const res = mockRes();
      await handler({ params: { id: VALID_OBJECT_ID } }, res, jest.fn());
      expect(res.statusCode).toBe(200);
      const body = res.body as any;
      expect(body.schemaVersion).toBe(REPLAY_SCHEMA_VERSION);
      expect(body.winner).toBe('Resistance');
      expect(body.events).toHaveLength(2);
    });

    it('returns 404 for invalid ObjectId', async () => {
      const handler = findRouteHandler('get', '/:id.json');
      const res = mockRes();
      await handler({ params: { id: 'not-an-objectid' } }, res, jest.fn());
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /:id/export', () => {
    it('sets Content-Disposition attachment header', async () => {
      (Replay as any).findOne.mockResolvedValue(dbReplay());
      const handler = findRouteHandler('get', '/:id/export');
      const res = mockRes();
      await handler({ params: { id: VALID_OBJECT_ID } }, res, jest.fn());
      expect(res.statusCode).toBe(200);
      expect(res.headers['Content-Disposition']).toContain('attachment');
      expect(res.headers['Content-Disposition']).toContain(
        `proavalon-replay-${VALID_OBJECT_ID}.json`,
      );
    });

    it('returns 404 when missing', async () => {
      (Replay as any).findOne.mockResolvedValue(null);
      (Replay as any).findById.mockResolvedValue(null);
      const handler = findRouteHandler('get', '/:id/export');
      const res = mockRes();
      await handler({ params: { id: VALID_OBJECT_ID } }, res, jest.fn());
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /:id', () => {
    it('renders replay view when found', async () => {
      (Replay as any).findOne.mockResolvedValue(dbReplay());
      const handler = findRouteHandler('get', '/:id');
      const res = mockRes();
      await handler({ params: { id: VALID_OBJECT_ID } }, res, jest.fn());
      expect(res.statusCode).toBe(200);
      expect(res.rendered?.template).toBe('replayRoom');
      const locals = res.rendered?.locals as any;
      // replayJson must be a string of JSON for the EJS to inline.
      expect(typeof locals.replayJson).toBe('string');
      const parsed = JSON.parse(
        locals.replayJson.replace(/\\u003c/g, '<'),
      );
      expect(parsed.winner).toBe('Resistance');
      // The </script> sentinel is escaped to prevent script-injection breakout.
      const closingScript = '</script>';
      expect(locals.replayJson.includes(closingScript)).toBe(false);
    });

    it('renders 404 simpleText view when not found', async () => {
      (Replay as any).findOne.mockResolvedValue(null);
      (Replay as any).findById.mockResolvedValue(null);
      const handler = findRouteHandler('get', '/:id');
      const res = mockRes();
      await handler({ params: { id: VALID_OBJECT_ID } }, res, jest.fn());
      expect(res.statusCode).toBe(404);
      expect(res.rendered?.template).toBe('simpleText');
    });
  });

  describe('GET /import', () => {
    it('renders viewer with no replay seeded', () => {
      const handler = findRouteHandler('get', '/import');
      const res = mockRes();
      handler({}, res, jest.fn());
      expect(res.rendered?.template).toBe('replayRoom');
      expect((res.rendered?.locals as any).replayJson).toBe('null');
    });
  });

  describe('GET / (replay index listing)', () => {
    it('renders the empty state when there are no replays', async () => {
      (Replay as any).__setListResult([]);
      const handler = findRouteHandler('get', '/');
      const res = mockRes();
      await handler({}, res, jest.fn());
      expect(res.rendered?.template).toBe('replayList');
      const locals = res.rendered?.locals as any;
      expect(locals.replays).toEqual([]);
      expect(locals.headerActive).toBe('replays');
      // Cap defaults to 50 unless we change the constant.
      expect(locals.limit).toBe(50);
    });

    it('renders rows mapped from the mongo docs', async () => {
      (Replay as any).__setListResult([
        {
          _id: 'replay-id-1',
          gameRecordId: VALID_OBJECT_ID,
          timeGameFinished: new Date('2026-05-15T12:00:00Z'),
          gameMode: 'avalon',
          numberOfPlayers: 5,
          winner: 'Resistance',
          howTheGameWasWon: 'Three missions succeeded.',
          anonymousMode: false,
          players: [
            { username: 'alice' },
            { username: 'bob' },
            { username: 'carol' },
            { username: 'dave' },
            { username: 'eve' },
          ],
        },
      ]);
      const handler = findRouteHandler('get', '/');
      const res = mockRes();
      await handler({}, res, jest.fn());
      expect(res.rendered?.template).toBe('replayList');
      const rows = (res.rendered?.locals as any).replays;
      expect(rows).toHaveLength(1);
      // The view link is built from gameRecordId, not the replay _id.
      expect(rows[0].id).toBe(VALID_OBJECT_ID);
      expect(rows[0].winner).toBe('Resistance');
      expect(rows[0].numberOfPlayers).toBe(5);
      expect(rows[0].players).toEqual([
        'alice',
        'bob',
        'carol',
        'dave',
        'eve',
      ]);
    });

    it('falls back to the replay _id when gameRecordId is missing', async () => {
      (Replay as any).__setListResult([
        {
          _id: 'orphan-replay-id',
          // No gameRecordId field at all.
          timeGameFinished: new Date('2026-05-15T12:00:00Z'),
          gameMode: 'avalon',
          numberOfPlayers: 5,
          winner: 'Spy',
          howTheGameWasWon: 'Three missions failed.',
          anonymousMode: false,
          players: [],
        },
      ]);
      const handler = findRouteHandler('get', '/');
      const res = mockRes();
      await handler({}, res, jest.fn());
      const rows = (res.rendered?.locals as any).replays;
      expect(rows[0].id).toBe('orphan-replay-id');
    });
  });
});
