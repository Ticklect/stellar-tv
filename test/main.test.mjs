import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadModuleInternals() {
  const source = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  const marker = '})();';
  const exportHook = `
    globalThis.__internals = {
      candidates: candidates,
      clampedSeekTime: clampedSeekTime,
      directionalScore: directionalScore,
      normalizedKey: normalizedKey,
      powHashHasPrefix: powHashHasPrefix,
      preferredInitial: preferredInitial,
      searchNavigationTarget: searchNavigationTarget,
      state: state
    };
  `;
  const instrumented = source.slice(0, source.lastIndexOf(marker)) + exportHook + marker;
  const listeners = new Map();
  const document = {
    activeElement: null,
    body: null,
    readyState: 'loading',
    addEventListener(type, listener) {
      listeners.set(type, listener);
    }
  };
  document.body = {
    contains: () => true,
    querySelectorAll: () => [],
    matches: () => false
  };
  const window = {
    addEventListener() {},
    console: { warn() {} },
    location: { pathname: '/' }
  };
  window.top = window;
  window.self = window;

  const context = {
    Blob,
    Date,
    Int32Array,
    Math,
    Promise,
    URL,
    WeakMap,
    clearTimeout,
    console: window.console,
    document,
    globalThis: null,
    isFinite,
    location: { hostname: 'example.com' },
    navigator: { userAgent: 'unit-test' },
    setInterval,
    setTimeout,
    window
  };
  context.globalThis = context;
  vm.runInNewContext(instrumented, context, { filename: 'main.js' });
  return { ...context.__internals, context };
}

const moduleUnderTest = loadModuleInternals();

test('runtime diagnostics version matches package metadata', () => {
  const packageJson = JSON.parse(
    fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')
  );
  assert.equal(
    moduleUnderTest.context.window.__goatedTizenBrewDiagnostics.version,
    packageJson.version
  );
});

test('normalizes Samsung key codes and standard browser keys', () => {
  const { normalizedKey } = moduleUnderTest;
  assert.equal(normalizedKey({ keyCode: 10009 }), 'Back');
  assert.equal(normalizedKey({ keyCode: 415 }), 'MediaPlay');
  assert.equal(normalizedKey({ which: 40 }), 'ArrowDown');
  assert.equal(normalizedKey({ key: 'Enter' }), 'Enter');
  assert.equal(normalizedKey({ code: 'NumpadEnter' }), 'NumpadEnter');
});

test('scores only candidates in the requested direction', () => {
  const { directionalScore } = moduleUnderTest;
  const origin = { x: 100, y: 100 };
  assert.equal(directionalScore(origin, { x: 140, y: 100 }, 'right', 100), 40);
  assert.equal(directionalScore(origin, { x: 60, y: 100 }, 'left', 100), 40);
  assert.equal(directionalScore(origin, { x: 100, y: 60 }, 'up', 100), 40);
  assert.equal(directionalScore(origin, { x: 100, y: 140 }, 'down', 100), 40);
  assert.equal(directionalScore(origin, { x: 90, y: 100 }, 'right', 100), Infinity);
});

test('penalizes off-axis spatial-navigation candidates', () => {
  const { directionalScore } = moduleUnderTest;
  const origin = { x: 0, y: 0 };
  const aligned = directionalScore(origin, { x: 100, y: 0 }, 'right', 0);
  const diagonal = directionalScore(origin, { x: 100, y: 20 }, 'right', 0);
  assert.ok(aligned < diagonal);
});

test('clamps seek targets to the media duration', () => {
  const { clampedSeekTime } = moduleUnderTest;
  assert.equal(clampedSeekTime(10, 100, -15), 0);
  assert.equal(clampedSeekTime(50, 100, 15), 65);
  assert.equal(clampedSeekTime(95, 100, 15), 100);
});

test('prefers the primary Play action for initial focus', () => {
  const { preferredInitial, context } = moduleUnderTest;
  context.window.getComputedStyle = () => ({
    display: 'block',
    visibility: 'visible',
    opacity: '1'
  });
  const makeElement = (label) => ({
    isConnected: true,
    parentElement: null,
    tagName: 'BUTTON',
    textContent: label,
    getAttribute: () => '',
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      right: 100,
      bottom: 40,
      width: 100,
      height: 40
    }),
    matches: () => true
  });
  const first = makeElement('Details');
  const play = makeElement('Play');
  const scope = {
    matches: () => false,
    querySelectorAll: () => [first, play]
  };
  assert.equal(preferredInitial(scope), play);
});

test('maps search focus down to Play and back up to the input', () => {
  const { searchNavigationTarget } = moduleUnderTest;
  const input = { tagName: 'INPUT', getAttribute: () => '', textContent: '' };
  const play = { tagName: 'BUTTON', getAttribute: () => 'Play', textContent: '' };
  const details = { tagName: 'BUTTON', getAttribute: () => 'Details', textContent: '' };
  const items = [input, details, play];
  assert.equal(searchNavigationTarget('down', input, items), play);
  assert.equal(searchNavigationTarget('up', play, items), input);
  assert.equal(searchNavigationTarget('left', play, items), null);
});

test('caches focus candidates until the DOM version changes', () => {
  const { candidates, context, state } = moduleUnderTest;
  context.window.getComputedStyle = () => ({ display: 'block', visibility: 'visible' });
  let queryCount = 0;
  const item = {
    disabled: false,
    isConnected: true,
    parentElement: null,
    tagName: 'BUTTON',
    getAttribute: () => '',
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 40 }),
    matches: () => true
  };
  const scope = {
    matches: () => false,
    querySelectorAll() {
      queryCount += 1;
      return [item];
    }
  };
  assert.equal(candidates(scope)[0], item);
  assert.equal(candidates(scope)[0], item);
  assert.equal(queryCount, 1);
  state.domVersion += 1;
  candidates(scope);
  assert.equal(queryCount, 2);
});

test('proof-of-work prefix check matches Node SHA-256', () => {
  const { powHashHasPrefix } = moduleUnderTest;
  const words = new Int32Array(64);
  for (const message of ['challenge0', 'goated12345', 'tv-navigation']) {
    const hex = crypto.createHash('sha256').update(message).digest('hex');
    for (const difficulty of [0, 1, 2, 3, 4]) {
      const expected = hex.startsWith('0'.repeat(difficulty));
      assert.equal(
        powHashHasPrefix(message, difficulty, words),
        expected,
        `${message}/${difficulty}`
      );
    }
  }
});
