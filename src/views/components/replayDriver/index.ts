/**
 * Replay driver.
 *
 * Renders a recorded ReplayDoc (schema v2) by replaying its spectator
 * gameData snapshots into the REAL room-rendering code (lobby.js /
 * sockets/game.js / chat.js), loaded on replayRoom.ejs with a fake socket.
 * The room look — avatars, guns, missions, vote badges, the vote-history
 * tab, chat styling — is therefore identical to the live game by
 * construction, not by imitation.
 *
 * Hardening rule: snapshot payloads are opaque (their shape tracks the live
 * client contract). Every render step is wrapped so an old export on a newer
 * client degrades with a banner instead of white-screening.
 */

import {
  ReplayDoc,
  ReplayEventKind,
  validateReplayDoc,
} from '../../../gameplay/gameEngine/replayTypes';

/* ------------------------------------------------------------------------ *
 * Global plumbing.
 *
 * The lobby scripts are classic scripts whose top-level `let` bindings
 * (roomId, gameData, roomPlayersData, gameStarted, ...) live in the global
 * environment record — NOT on window. Sloppy-mode assignment from a
 * generated function reaches them; direct `window.x =` does not.
 * ------------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const win = window as any;

function setGlobal(name: string, value: unknown): void {
  // eslint-disable-next-line no-new-func
  new Function('v', `${name} = v;`)(value);
}

function getGlobal(name: string): any {
  // eslint-disable-next-line no-new-func
  return new Function(
    `return typeof ${name} === 'undefined' ? undefined : ${name};`,
  )();
}

const MAX_IMPORT_BYTES = 8 * 1024 * 1024;

const CHAPTER_KINDS: ReadonlySet<string> = new Set([
  ReplayEventKind.TeamProposed,
  ReplayEventKind.VotesRevealed,
  ReplayEventKind.MissionResult,
  ReplayEventKind.AssassinShot,
  ReplayEventKind.MerlinGuess,
  ReplayEventKind.LadyUsed,
  ReplayEventKind.RefUsed,
  ReplayEventKind.SireUsed,
  ReplayEventKind.GameFinished,
]);

interface DriverState {
  doc: ReplayDoc | null;
  cursor: number;
  omniscient: boolean;
  playing: boolean;
  realtime: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  startMs: number;
  degraded: boolean;
}

const state: DriverState = {
  doc: null,
  cursor: 0,
  omniscient: false,
  playing: false,
  realtime: false,
  timer: null,
  startMs: 0,
  degraded: false,
};

/* ------------------------------------------------------------------------ *
 * Snapshot transforms.
 * ------------------------------------------------------------------------ */

function transformSnapshot(
  doc: ReplayDoc,
  index: number,
  omniscient: boolean,
): Record<string, any> {
  const g: Record<string, any> = JSON.parse(
    JSON.stringify(doc.snapshots[index].g),
  );

  // Freeze the room countdown timer and make sure the room can never enter
  // pick mode (clickable avatars) even when the replay viewer was a player
  // in the recorded game.
  g.dateTimerExpires = null;
  g.numSelectTargets = null;
  g.prohibitedIndexesToPicks = null;

  if (omniscient) {
    // Overlay true roles from the post-game player list (seat order), using
    // THIS snapshot's displayed name ordering so it works before and after
    // the anonymous-mode reveal.
    const order: string[] = Array.isArray(g.playerUsernamesOrdered)
      ? g.playerUsernamesOrdered
      : [];
    const spies: string[] = [];
    const roles: string[] = [];
    // roleTags drive the per-avatar role label pre-finish (strOfAvatar's
    // roleTags branch — the same mechanism Merlin's "Spy?" tags use live).
    // At Finished, strOfAvatar's see.roles branch takes precedence, which
    // is the normal end-of-game reveal.
    const roleTags: Record<string, string> = {};
    for (let seat = 0; seat < doc.players.length; seat++) {
      const p = doc.players[seat];
      const trueRole = p ? p.role || (p as any).displayRole || '' : '';
      roles.push(trueRole);
      if (p && order[seat]) {
        roleTags[order[seat]] = trueRole;
        if (p.alliance === 'Spy') {
          spies.push(order[seat]);
        }
      }
    }
    const prevMerlins =
      g.see && Array.isArray(g.see.merlins) ? g.see.merlins : [];
    g.see = { spies, roles, merlins: prevMerlins, roleTags };
  }

  return g;
}

/** Most recent room-players list at or before snapshot `index`. */
function roomPlayersAt(
  doc: ReplayDoc,
  index: number,
): Record<string, unknown>[] {
  let rp = doc.roomPlayers;
  for (let k = 0; k <= index && k < doc.snapshots.length; k++) {
    const delta = doc.snapshots[k].rp;
    if (delta) rp = delta;
  }
  return rp;
}

/* ------------------------------------------------------------------------ *
 * Rendering.
 * ------------------------------------------------------------------------ */

function showDegradedBanner(): void {
  if (state.degraded) return;
  state.degraded = true;
  const el = document.getElementById('replayDegradedBanner');
  if (el) el.classList.remove('hidden');
}

function rebuildChat(doc: ReplayDoc, cutoffT: number): void {
  const $ = win.$;
  const addToRoomChat = getGlobal('addToRoomChat');
  if (!$ || typeof addToRoomChat !== 'function') return;

  $('.room-chat-list').empty();

  const lines = doc.chat
    .filter((c) => c.t <= cutoffT)
    .map((c) => ({
      message: c.m,
      classStr: c.c,
      username: c.u,
      dateCreated: new Date(state.startMs + c.t),
    }));
  if (lines.length > 0) {
    addToRoomChat(lines);
  }
  // Pin both room chat panes to the bottom, like live.
  $('.room-chat-list').each(function (this: HTMLElement) {
    const pane = this.parentElement;
    if (pane) pane.scrollTop = pane.scrollHeight;
  });
}

function seek(index: number): void {
  const doc = state.doc;
  if (!doc || doc.snapshots.length === 0) return;
  const max = doc.snapshots.length - 1;
  const i = Math.max(0, Math.min(max, index));
  state.cursor = i;

  try {
    const g = transformSnapshot(doc, i, state.omniscient);

    setGlobal('roomPlayersData', roomPlayersAt(doc, i));
    // The game-data handler guards on roomId equality.
    setGlobal('roomId', g.roomId);

    const socket = getGlobal('socket');
    socket.trigger('game-data', g);
  } catch (e) {
    // Old export / newer client: degrade, don't white-screen.
    // eslint-disable-next-line no-console
    console.error('[Replay] render failed at snapshot', i, e);
    showDegradedBanner();
  }

  try {
    rebuildChat(doc, doc.snapshots[i].t);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[Replay] chat rebuild failed', e);
    showDegradedBanner();
  }

  updateToolbar();
}

/* ------------------------------------------------------------------------ *
 * Chapters (from the semantic event log).
 * ------------------------------------------------------------------------ */

interface Chapter {
  t: number;
  label: string;
}

function buildChapters(doc: ReplayDoc): Chapter[] {
  return doc.events
    .filter((e) => CHAPTER_KINDS.has(e.k))
    .map((e) => ({ t: e.t, label: e.k }));
}

function nextChapterIndex(doc: ReplayDoc, chapters: Chapter[]): number {
  const curT = doc.snapshots[state.cursor].t;
  const target = chapters.find((c) => c.t > curT);
  if (!target) return doc.snapshots.length - 1;
  // First snapshot at or after the chapter time.
  for (let i = 0; i < doc.snapshots.length; i++) {
    if (doc.snapshots[i].t >= target.t) return i;
  }
  return doc.snapshots.length - 1;
}

function prevChapterIndex(doc: ReplayDoc, chapters: Chapter[]): number {
  const curT = doc.snapshots[state.cursor].t;
  const before = chapters.filter((c) => c.t < curT);
  const target = before[before.length - 1];
  if (!target) return 0;
  // Last snapshot at or before the chapter time... then the snapshot AT the
  // chapter (first at/after) reads better when stepping back.
  for (let i = 0; i < doc.snapshots.length; i++) {
    if (doc.snapshots[i].t >= target.t) return i;
  }
  return 0;
}

/* ------------------------------------------------------------------------ *
 * Playback.
 * ------------------------------------------------------------------------ */

const FIXED_STEP_MS = 800;
const REALTIME_MIN_MS = 200;
const REALTIME_MAX_MS = 5000;

function stopPlayback(): void {
  state.playing = false;
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
  updateToolbar();
}

function scheduleNext(): void {
  const doc = state.doc;
  if (!doc || !state.playing) return;
  if (state.cursor >= doc.snapshots.length - 1) {
    stopPlayback();
    return;
  }
  let delay = FIXED_STEP_MS;
  if (state.realtime) {
    const dt =
      doc.snapshots[state.cursor + 1].t - doc.snapshots[state.cursor].t;
    delay = Math.max(REALTIME_MIN_MS, Math.min(REALTIME_MAX_MS, dt));
  }
  state.timer = setTimeout(() => {
    seek(state.cursor + 1);
    scheduleNext();
  }, delay);
}

function togglePlayback(): void {
  if (state.playing) {
    stopPlayback();
    return;
  }
  const doc = state.doc;
  if (!doc) return;
  if (state.cursor >= doc.snapshots.length - 1) {
    seek(0);
  }
  state.playing = true;
  updateToolbar();
  scheduleNext();
}

/* ------------------------------------------------------------------------ *
 * Import / export.
 * ------------------------------------------------------------------------ */

function exportDoc(): void {
  const doc = state.doc;
  if (!doc) return;
  const payload = JSON.stringify(doc, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `proavalon-replay-${doc.gameRecordId || 'imported'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importFile(file: File): void {
  const errEl = document.getElementById('replayImportError');
  const setErr = (msg: string) => {
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.remove('hidden');
    }
  };
  if (errEl) errEl.classList.add('hidden');

  if (file.size > MAX_IMPORT_BYTES) {
    setErr('File too large (max 8MB).');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const result = validateReplayDoc(parsed);
      if (!result.ok) {
        setErr(result.reason || 'Invalid replay file.');
        return;
      }
      start(parsed as ReplayDoc);
    } catch (e) {
      setErr('Could not parse JSON file.');
    }
  };
  reader.onerror = () => setErr('Failed to read file.');
  reader.readAsText(file);
}

/* ------------------------------------------------------------------------ *
 * Toolbar.
 * ------------------------------------------------------------------------ */

function formatTime(ms: number): string {
  const clamped = ms < 0 ? 0 : ms;
  const totalSec = Math.floor(clamped / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string>,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const k of Object.keys(attrs)) {
    node.setAttribute(k, attrs[k]);
  }
  if (text !== undefined) node.textContent = text;
  return node;
}

function updateToolbar(): void {
  const doc = state.doc;
  if (!doc) return;
  const slider = document.getElementById(
    'replaySlider',
  ) as HTMLInputElement | null;
  if (slider) slider.value = String(state.cursor);

  const caption = document.getElementById('replayCaption');
  if (caption) {
    const snap = doc.snapshots[state.cursor];
    const g: any = snap.g || {};
    const bits: string[] = [];
    if (typeof g.missionNum === 'number' && typeof g.pickNum === 'number') {
      bits.push(`Mission ${g.missionNum}, pick ${g.pickNum}`);
    }
    if (typeof g.phase === 'string') bits.push(g.phase);
    bits.push(formatTime(snap.t));
    bits.push(`${state.cursor + 1}/${doc.snapshots.length}`);
    caption.textContent = bits.join(' · ');
  }

  const playBtn = document.getElementById('replayPlayBtn');
  if (playBtn) playBtn.textContent = state.playing ? '❚❚ Pause' : '▶ Play';
}

function buildToolbar(doc: ReplayDoc): void {
  const mount = document.getElementById('replayToolbar');
  if (!mount) return;
  mount.innerHTML = '';
  mount.classList.remove('hidden');

  const chapters = buildChapters(doc);
  const maxIdx = doc.snapshots.length - 1;

  const row = el('div', { class: 'replay-toolbar-row' });

  const backLink = el(
    'a',
    { class: 'btn btn-default btn-sm', href: '/replay' },
    '≡ Replays',
  );
  row.appendChild(backLink);

  const prevCh = el(
    'button',
    { class: 'btn btn-default btn-sm', id: 'replayPrevChapter', type: 'button' },
    '◀◀',
  );
  prevCh.addEventListener('click', () => {
    stopPlayback();
    seek(prevChapterIndex(doc, chapters));
  });
  row.appendChild(prevCh);

  const stepBack = el(
    'button',
    { class: 'btn btn-default btn-sm', type: 'button' },
    '◀',
  );
  stepBack.addEventListener('click', () => {
    stopPlayback();
    seek(state.cursor - 1);
  });
  row.appendChild(stepBack);

  const playBtn = el(
    'button',
    { class: 'btn btn-primary btn-sm', id: 'replayPlayBtn', type: 'button' },
    '▶ Play',
  );
  playBtn.addEventListener('click', togglePlayback);
  row.appendChild(playBtn);

  const stepFwd = el(
    'button',
    { class: 'btn btn-default btn-sm', type: 'button' },
    '▶',
  );
  stepFwd.addEventListener('click', () => {
    stopPlayback();
    seek(state.cursor + 1);
  });
  row.appendChild(stepFwd);

  const nextCh = el(
    'button',
    { class: 'btn btn-default btn-sm', id: 'replayNextChapter', type: 'button' },
    '▶▶',
  );
  nextCh.addEventListener('click', () => {
    stopPlayback();
    seek(nextChapterIndex(doc, chapters));
  });
  row.appendChild(nextCh);

  const speed = el('select', {
    class: 'form-control input-sm replay-speed',
    id: 'replaySpeed',
  });
  speed.appendChild(el('option', { value: 'fixed' }, 'Steady steps'));
  speed.appendChild(el('option', { value: 'realtime' }, 'Real-time pacing'));
  speed.addEventListener('change', () => {
    state.realtime = (speed as HTMLSelectElement).value === 'realtime';
  });
  row.appendChild(speed);

  const revealLabel = el('label', { class: 'replay-reveal-label' });
  const reveal = el('input', { type: 'checkbox', id: 'replayReveal' });
  reveal.addEventListener('change', () => {
    state.omniscient = (reveal as HTMLInputElement).checked;
    seek(state.cursor);
  });
  revealLabel.appendChild(reveal);
  revealLabel.appendChild(document.createTextNode(' Reveal roles'));
  row.appendChild(revealLabel);

  const exportBtn = el(
    'button',
    { class: 'btn btn-default btn-sm', type: 'button' },
    'Export',
  );
  exportBtn.addEventListener('click', exportDoc);
  row.appendChild(exportBtn);

  const importLabel = el(
    'label',
    { class: 'btn btn-default btn-sm replay-import-label' },
    'Import…',
  );
  const importInput = el('input', {
    type: 'file',
    accept: '.json,application/json',
    style: 'display: none',
  }) as HTMLInputElement;
  importInput.addEventListener('change', () => {
    const f = importInput.files && importInput.files[0];
    if (f) {
      stopPlayback();
      importFile(f);
    }
  });
  importLabel.appendChild(importInput);
  row.appendChild(importLabel);

  const caption = el('span', { class: 'replay-caption', id: 'replayCaption' });
  row.appendChild(caption);

  mount.appendChild(row);

  const sliderWrap = el('div', { class: 'replay-slider-wrap' });
  const slider = el('input', {
    type: 'range',
    id: 'replaySlider',
    class: 'replay-slider',
    min: '0',
    max: String(maxIdx),
    value: '0',
  }) as HTMLInputElement;
  slider.addEventListener('input', () => {
    stopPlayback();
    seek(Number(slider.value));
  });
  sliderWrap.appendChild(slider);

  // Chapter ticks, positioned by snapshot index proportion.
  const ticks = el('div', { class: 'replay-ticks' });
  for (const c of chapters) {
    let idx = maxIdx;
    for (let i = 0; i < doc.snapshots.length; i++) {
      if (doc.snapshots[i].t >= c.t) {
        idx = i;
        break;
      }
    }
    const pct = maxIdx === 0 ? 0 : (idx / maxIdx) * 100;
    const tick = el('span', {
      class: 'replay-tick',
      style: `left: ${pct}%`,
      title: c.label,
    });
    ticks.appendChild(tick);
  }
  sliderWrap.appendChild(ticks);
  mount.appendChild(sliderWrap);
}

/* ------------------------------------------------------------------------ *
 * Boot.
 * ------------------------------------------------------------------------ */

function start(doc: ReplayDoc): void {
  stopPlayback();
  state.doc = doc;
  state.cursor = 0;
  state.omniscient = false;
  state.degraded = false;
  state.startMs = new Date(doc.timeGameStarted).getTime() || 0;

  const importPanel = document.getElementById('replayImportPanel');
  if (importPanel) importPanel.classList.add('hidden');
  const banner = document.getElementById('replayDegradedBanner');
  if (banner) banner.classList.add('hidden');

  // Show the room (the shared partial ships inactive) and mark replay mode
  // for the hide-interactive-controls CSS.
  document.body.classList.add('replay-mode');
  const container = document.querySelector('.game-container');
  if (container) container.classList.remove('inactive-window');

  const reveal = document.getElementById(
    'replayReveal',
  ) as HTMLInputElement | null;
  if (reveal) reveal.checked = false;

  buildToolbar(doc);
  seek(0);
}

function init(): void {
  const initial = win.__REPLAY__;
  if (initial) {
    const result = validateReplayDoc(initial);
    if (result.ok) {
      start(initial as ReplayDoc);
      return;
    }
    const errEl = document.getElementById('replayImportError');
    if (errEl) {
      errEl.textContent = result.reason || 'Invalid replay.';
      errEl.classList.remove('hidden');
    }
  }
  // Import mode: wire the file picker on the landing panel.
  const picker = document.getElementById(
    'replayImportInput',
  ) as HTMLInputElement | null;
  if (picker) {
    picker.addEventListener('change', () => {
      const f = picker.files && picker.files[0];
      if (f) importFile(f);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Exposed for the jsdom harness test.
win.__replayDriver = { start, seek, state, transformSnapshot, roomPlayersAt };
