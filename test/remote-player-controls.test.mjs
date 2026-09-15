import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadRemoteHandler() {
  const source = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  const marker = '})();';
  const exportHook = `
    globalThis.__playerRemoteInternals = {
      handleKeyDown: handleKeyDown,
      state: state
    };
  `;
  const instrumented = source.slice(0, source.lastIndexOf(marker)) + exportHook + marker;

  const document = {
    activeElement: null,
    body: null,
    documentElement: {},
    readyState: 'loading',
    scrollingElement: { scrollTop: 0, scrollLeft: 0 },
    addEventListener() {},
    querySelectorAll() {
      return [];
    },
    querySelector() {
      return null;
    }
  };
  document.body = {
    contains: () => true,
    querySelectorAll: () => [],
    matches: () => false
  };
  document.activeElement = document.body;

  class KeyboardEventStub {
    constructor(type, init) {
      this.type = type;
      Object.assign(this, init);
    }
  }

  const window = {
    KeyboardEvent: KeyboardEventStub,
    addEventListener() {},
    console: { warn() {} },
    innerHeight: 540,
    innerWidth: 960,
    location: { pathname: '/watch/example' },
    scrollTo() {},
    getComputedStyle() {
      return {
        display: 'block',
        visibility: 'visible',
        overflow: 'visible',
        overflowY: 'visible',
        position: 'static',
        zIndex: '0'
      };
    }
  };
  window.top = window;
  window.self = window;

  const context = {
    Blob,
    Date,
    Int32Array,
    Math,
    Object,
    Promise,
    URL,
    WeakMap,
    clearTimeout,
    console: window.console,
    document,
    globalThis: null,
    isFinite,
    location: { hostname: 'example.com' },
    navigator: { userAgent: 'Tizen unit-test' },
    setInterval,
    setTimeout,
    window
  };
  context.globalThis = context;
  vm.runInNewContext(instrumented, context, { filename: 'main.js' });
  return { ...context.__playerRemoteInternals, context };
}

function makeClassList() {
  const values = new Set();
  return {
    add(name) {
      values.add(name);
    },
    remove(name) {
      values.delete(name);
    },
    contains(name) {
      return values.has(name);
    }
  };
}

test('Tizen Left and Right adjust a focused custom player slider instead of seeking video', () => {
  const { context, handleKeyDown, state } = loadRemoteHandler();
  let forwardedKey = null;
  const slider = {
    classList: makeClassList(),
    children: [],
    disabled: false,
    isConnected: true,
    parentElement: null,
    tagName: 'DIV',
    getAttribute(name) {
      return name === 'role' ? 'slider' : null;
    },
    getBoundingClientRect() {
      return { left: 20, top: 420, right: 500, bottom: 460, width: 480, height: 40 };
    },
    closest() {
      return null;
    },
    contains(node) {
      return node === slider;
    },
    dispatchEvent(event) {
      forwardedKey = event.key;
      return true;
    }
  };
  slider.classList.add('goated-tv-focused');

  const video = {
    currentTime: 50,
    duration: 100,
    paused: false,
    getBoundingClientRect() {
      return { left: 0, top: 0, right: 960, bottom: 540, width: 960, height: 540 };
    },
    dispatchEvent() {}
  };
  context.document.querySelector = (selector) => (selector === 'video' ? video : null);
  context.document.activeElement = slider;
  state.current = slider;

  let prevented = false;
  let stopped = false;
  handleKeyDown({
    key: 'ArrowRight',
    keyCode: 39,
    preventDefault() {
      prevented = true;
    },
    stopPropagation() {
      stopped = true;
    }
  });

  assert.equal(forwardedKey, 'ArrowRight');
  assert.equal(video.currentTime, 50);
  assert.equal(prevented, true);
  assert.equal(stopped, true);
});
