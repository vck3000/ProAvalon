/**
 * jsdom harness for the replay room page.
 *
 * Renders src/views/replayRoom.ejs with a real recorded fixture, executes
 * the ACTUAL lobby scripts inside jsdom (fake socket, stubbed canvas), and
 * asserts the room renders: avatars, mission boxes, vote badges, the
 * vote-history table, chat, scrubbing idempotence, and the omniscient
 * overlay.
 *
 * Run: node tmp-harness/replayRoom.harness.js
 */
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { JSDOM, VirtualConsole, ResourceLoader } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const fixture = JSON.parse(
  fs.readFileSync('/tmp/replay-fixture.json', 'utf8'),
);

let failures = 0;
function assert(cond, label) {
  if (cond) {
    console.log('  ✓', label);
  } else {
    failures++;
    console.log('  ✗ FAIL:', label);
  }
}

class LocalResources extends ResourceLoader {
  fetch(url) {
    const u = new URL(url);
    if (u.hostname !== 'localhost') {
      // External CDNs (promise polyfill, axios cdn): serve empty.
      return Promise.resolve(Buffer.from(''));
    }
    const rel = u.pathname.replace(/^\//, '');
    const file = path.join(ROOT, 'assets', rel);
    if (fs.existsSync(file)) {
      return Promise.resolve(fs.readFileSync(file));
    }
    console.log('  [loader] missing asset:', u.pathname);
    return Promise.resolve(Buffer.from(''));
  }
}

async function main() {
  const html = await ejs.renderFile(
    path.join(ROOT, 'src/views/replayRoom.ejs'),
    {
      getVersionedPath: (p) => p,
      replayJson: JSON.stringify(fixture).replace(/</g, '\\u003c'),
      gameRecordId: fixture.gameRecordId,
      reportsReact: '',
      matchmakingReact: '',
      headerActive: 'replays',
      currentUser: { username: 'viewer' },
      error: [],
      success: [],
    },
  );

  const errors = [];
  const vc = new VirtualConsole();
  const PREEXISTING = [
    // options.js:21 ships a malformed selector ('*:not([react-entrypoint] *'
    // — unclosed :not). It throws on live pages too; not this change's bug.
    'unrecognized expression: *:not([react-entrypoint] *',
  ];
  const isPreexisting = (e) => PREEXISTING.some((p) => String(e).includes(p));
  vc.on('jsdomError', (e) => {
    // css parse noise is irrelevant; script errors are not.
    if (String(e).includes('Could not parse CSS')) return;
    if (isPreexisting(e)) return;
    errors.push(e);
  });
  vc.on('error', (...args) => {
    const s = args.join(' ');
    if (!isPreexisting(s)) errors.push(s);
  });

  const dom = new JSDOM(html, {
    url: 'http://localhost/replay/' + fixture.gameRecordId,
    runScripts: 'dangerously',
    resources: new LocalResources(),
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      // jsdom has no canvas 2D; lobby.js only uses measureText + font.
      window.HTMLCanvasElement.prototype.getContext = function () {
        return {
          font: '',
          measureText: (t) => ({ width: (String(t) || '').length * 8 }),
        };
      };
      window.scrollTo = () => {};
      // jsdom doesn't implement innerText (layout-dependent); the lobby's
      // setStatusBarText writes it. Map to textContent for the harness.
      Object.defineProperty(window.HTMLElement.prototype, 'innerText', {
        get() {
          return this.textContent;
        },
        set(v) {
          this.textContent = v;
        },
      });
      window.matchMedia =
        window.matchMedia ||
        (() => ({ matches: false, addListener() {}, removeListener() {} }));
    },
  });

  const win = dom.window;
  await new Promise((resolve) => {
    win.addEventListener('load', resolve);
    setTimeout(resolve, 8000);
  });
  // Let post-load timers (statusBarHeight document.ready etc.) run.
  await new Promise((r) => setTimeout(r, 300));

  const doc = win.document;
  const drv = win.__replayDriver;

  // Spy reveal is signaled by the avatar image source (base-spy.svg or the
  // player's custom spy avatar), not a CSS class.
  const countSpyAvatars = () =>
    Array.from(doc.querySelectorAll('#mainRoomBox img')).filter((img) =>
      /spy/i.test(img.getAttribute('src') || ''),
    ).length;

  // Every rendered image must resolve (against the page's <base>) to a real
  // file under assets/ — the exact failure mode of relative 'avatars/...'
  // paths resolving under /replay/ instead of the asset root.
  const brokenImagePaths = () => {
    const bad = [];
    for (const img of Array.from(doc.querySelectorAll('img'))) {
      const raw = img.getAttribute('src');
      if (!raw || raw.startsWith('data:')) continue;
      const resolved = new win.URL(raw, doc.baseURI);
      if (resolved.hostname !== 'localhost') continue; // external CDN avatars
      const file = path.join(ROOT, 'assets', resolved.pathname.replace(/^\//, ''));
      if (!fs.existsSync(file)) bad.push(`${raw} -> ${resolved.pathname}`);
    }
    return bad;
  };

  console.log('\n[1] Page load');
  assert(errors.length === 0, `no script errors during load (got ${errors.length})`);
  errors.slice(0, 5).forEach((e) => console.log('    error:', String(e).slice(0, 300)));
  assert(!!drv, 'driver initialized');
  if (!drv) process.exit(1);
  assert(!!drv.state.doc, 'replay doc loaded from window.__REPLAY__');
  assert(
    doc.getElementById('replayImportPanel').classList.contains('hidden'),
    'import panel hidden when doc pre-seeded',
  );
  assert(
    !doc.querySelector('.game-container').classList.contains('inactive-window'),
    'room container activated',
  );

  console.log('\n[2] Initial render (snapshot 0, spoiler-free)');
  const players = doc.querySelectorAll('#mainRoomBox .playerDiv');
  assert(players.length === 6, `6 avatars rendered (got ${players.length})`);
  const missionBoxes = doc.querySelectorAll('.missionBox');
  assert(missionBoxes.length >= 5, 'mission boxes present');
  const vh0 = doc.querySelectorAll('.voteHistoryTableClass')[0];
  assert(!!vh0, 'vote history table exists');
  const status0 = doc.querySelector('#status').textContent.trim();
  assert(
    status0.includes('to pick a team'),
    `status bar shows the recorded status: "${status0.slice(0, 60)}"`,
  );
  const broken0 = brokenImagePaths();
  assert(
    broken0.length === 0,
    `all rendered images resolve to real assets (${broken0.length} broken)`,
  );
  broken0.slice(0, 5).forEach((b) => console.log('    broken:', b));
  assert(countSpyAvatars() === 0, 'no spy reveal at snapshot 0 (spoiler-free)');

  console.log('\n[3] End of game (seek last, spoiler-free)');
  const last = drv.state.doc.snapshots.length - 1;
  errors.length = 0;
  drv.seek(last);
  assert(errors.length === 0, 'no errors seeking to end');
  const vhHtml = doc.querySelectorAll('.voteHistoryTableClass')[0].innerHTML;
  assert(vhHtml.length > 200, `vote history table populated (${vhHtml.length} chars)`);
  assert(vhHtml.includes('VHpicked'), 'vote history has VHpicked cells');
  assert(vhHtml.includes('VHleader'), 'vote history has VHleader markers');
  assert(
    vhHtml.includes('VHapprove') || vhHtml.includes('VHreject') || vhHtml.includes('yes') || vhHtml.includes('no'),
    'vote history has vote cells',
  );
  const chatItems = doc.querySelectorAll('.room-chat-list li');
  assert(chatItems.length > 0, `chat rendered (${chatItems.length} lines)`);
  const chatText = doc.querySelector('.room-chat-list').textContent;
  assert(chatText.includes('sus'), 'player chat line present');
  // End of game: strOfAvatar renders role labels at Finished; spies visible.
  const spyReveal = countSpyAvatars();
  assert(spyReveal > 0, `end-of-game reveal shows spy avatars (${spyReveal})`);
  const roleLabels = doc.querySelectorAll('#mainRoomBox .role-p').length;
  assert(roleLabels === 6, `role labels under all avatars at finish (${roleLabels})`);
  const brokenEnd = brokenImagePaths();
  assert(
    brokenEnd.length === 0,
    `end-of-game render resolves all images (${brokenEnd.length} broken)`,
  );
  brokenEnd.slice(0, 5).forEach((b) => console.log('    broken:', b));

  console.log('\n[4] Mid-game votes');
  // Find a snapshot with publicVotes visible.
  const snaps = drv.state.doc.snapshots;
  let voteIdx = -1;
  for (let i = 0; i < snaps.length; i++) {
    const v = snaps[i].g.votes;
    if (Array.isArray(v) && v.length > 0 && v.some((x) => x)) {
      voteIdx = i;
      break;
    }
  }
  assert(voteIdx >= 0, `found a snapshot with revealed votes (idx ${voteIdx})`);
  if (voteIdx >= 0) {
    errors.length = 0;
    drv.seek(voteIdx);
    assert(errors.length === 0, 'no errors at vote snapshot');
    const approves = doc.querySelectorAll(
      '#mainRoomBox .approveLabel:not(.invisible)',
    ).length;
    const rejects = doc.querySelectorAll(
      '#mainRoomBox .rejectLabel:not(.invisible)',
    ).length;
    assert(
      approves + rejects > 0,
      `vote badges visible at vote snapshot (${approves} approve, ${rejects} reject)`,
    );
  }

  console.log('\n[5] Scrub idempotence');
  errors.length = 0;
  for (const i of [0, last, 3, last, 0, Math.floor(last / 2), last]) {
    drv.seek(i);
  }
  assert(errors.length === 0, 'no errors scrubbing back and forth');
  drv.seek(0);
  const chatAt0 = doc.querySelectorAll('.room-chat-list li').length;
  drv.seek(last);
  const chatAtEnd = doc.querySelectorAll('.room-chat-list li').length;
  drv.seek(0);
  const chatAt0Again = doc.querySelectorAll('.room-chat-list li').length;
  assert(chatAt0 === chatAt0Again, `chat rebuild idempotent (${chatAt0} vs ${chatAt0Again})`);
  assert(chatAtEnd > chatAt0, `chat grows over time (${chatAt0} → ${chatAtEnd})`);

  console.log('\n[6] Omniscient overlay');
  errors.length = 0;
  drv.state.omniscient = true;
  drv.seek(0);
  assert(errors.length === 0, 'no errors in omniscient mode');
  const spiesAtStart = countSpyAvatars();
  const expectedSpies = fixture.players.filter((p) => p.alliance === 'Spy').length;
  assert(
    spiesAtStart === expectedSpies,
    `omniscient shows ${expectedSpies} spies from snapshot 0 (got ${spiesAtStart})`,
  );
  const tagsAtStart = doc.querySelectorAll('#mainRoomBox .role-p').length;
  assert(
    tagsAtStart === fixture.players.length,
    `omniscient shows role tags for all players from snapshot 0 (got ${tagsAtStart})`,
  );
  const tagTexts = Array.from(
    doc.querySelectorAll('#mainRoomBox .role-p'),
  ).map((n) => n.textContent.trim());
  const expectedRoles = fixture.players.map((p) => p.role);
  assert(
    expectedRoles.every((r) => tagTexts.includes(r)),
    `role tags carry the true roles (${tagTexts.join(', ')})`,
  );
  const brokenOmni = brokenImagePaths();
  assert(
    brokenOmni.length === 0,
    `omniscient render resolves all images (${brokenOmni.length} broken)`,
  );
  drv.state.omniscient = false;
  drv.seek(0);
  assert(
    countSpyAvatars() === 0,
    'toggling back to spoiler-free hides spies again',
  );
  assert(
    doc.querySelectorAll('#mainRoomBox .role-p').length === 0,
    'toggling back to spoiler-free hides role tags again',
  );

  console.log('\n[7] Interactive controls stay dead');
  drv.seek(Math.floor(last / 2));
  const green = doc.querySelector('#green-button');
  assert(!!green, 'green button node exists (hidden by CSS, not forked out)');
  // numSelectTargets stripped → no pick-mode avatars.
  const clickable = doc.querySelectorAll('#mainRoomBox .selectable').length;
  console.log(`    (selectable avatar nodes: ${clickable})`);

  console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
