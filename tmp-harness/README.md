# Replay room jsdom harness

Headless functional test for the replay room page. It renders
`src/views/replayRoom.ejs` with a real recorded game, executes the actual
lobby scripts (lobby.js, sockets/game.js, chat.js, ...) inside jsdom against
the shared gameRoom partial, and asserts:

- page loads with zero script errors
- avatars, mission boxes, status bar, and the vote-history table render from
  snapshot data (VHpicked / VHleader cell structure, identical to live)
- chat renders with live styling and rebuilds idempotently while scrubbing
- vote badges (approve/reject labels) appear at vote snapshots
- spoiler-free default: no spy avatars until the recorded end-of-game reveal
- omniscient toggle shows the correct spy avatars from snapshot 0 and hides
  them again when toggled off

## Running

Requires `jsdom@24` (v25+ removed the `ResourceLoader` API this uses). It is
intentionally NOT a package.json dependency; install ad hoc:

```
npm install --no-save jsdom@24
npx jest src/gameplay/gameEngine/tests/replayFixtureGenerator.test.ts   # writes /tmp/replay-fixture.json
node tmp-harness/replayRoom.harness.js
```

Expected output ends with `ALL PASS`.

## Known jsdom deviations (harness shims, not page bugs)

- canvas 2D is stubbed (`measureText` returns width by character count);
  lobby.js only uses it to size labels.
- `innerText` is mapped to `textContent` (jsdom doesn't do layout).
- `assets/scripts/lobby/options.js:21` ships a malformed jQuery selector
  (`*:not([react-entrypoint] *` — unclosed `:not(`). It throws on live pages
  too; the harness whitelists it. Pre-existing bug, worth fixing separately.

This harness complements — not replaces — a real-browser smoke test for
layout, positioning, and theming.
