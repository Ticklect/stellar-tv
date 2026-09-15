import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function makeClassList(initial = []) {
  const values = new Set(initial);
  return {
    add(...names) {
      names.forEach((name) => values.add(name));
    },
    remove(...names) {
      names.forEach((name) => values.delete(name));
    },
    contains(name) {
      return values.has(name);
    }
  };
}

function loadModuleInternals() {
  const source = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  const marker = '})();';
  const exportHook = `
    globalThis.__remoteBackInternals = {
      closeCurrentLayer: closeCurrentLayer,
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
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    }
  };

  const window = {
    addEventListener() {},
    console: { warn() {} },
    history: { length: 1 },
    innerHeight: 540,
    innerWidth: 960,
    location: { pathname: '/search' },
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
  return { ...context.__remoteBackInternals, context };
}

function makeElement(context, options = {}) {
  const attributes = { ...(options.attributes || {}) };
  const classList = makeClassList(options.classes || []);
  const element = {
    classList,
    children: [],
    disabled: false,
    isConnected: true,
    isContentEditable: false,
    parentElement: null,
    tagName: options.tagName || 'BUTTON',
    textContent: options.textContent || '',
    type: options.type || '',
    blur() {
      context.document.activeElement = context.document.body;
    },
    contains(node) {
      return node === element;
    },
    focus() {
      context.document.activeElement = element;
    },
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(attributes, name) ? attributes[name] : null;
    },
    getBoundingClientRect() {
      return { left: 20, top: 20, right: 220, bottom: 60, width: 200, height: 40 };
    },
    hasAttribute(name) {
      return Object.prototype.hasOwnProperty.call(attributes, name);
    },
    matches() {
      return true;
    },
    querySelector() {
      return null;
    },
    setAttribute(name, value) {
      attributes[name] = String(value);
    }
  };
  return element;
}

test('Back leaves a focused text field instead of immediately refocusing it', () => {
  const { closeCurrentLayer, context, state } = loadModuleInternals();
  const input = makeElement(context, { tagName: 'INPUT', type: 'text' });
  const nextControl = makeElement(context, { tagName: 'BUTTON', textContent: 'Filters' });
  input.classList.add('goated-tv-focused');

  context.document.body = {
    contains: (element) => element === input || element === nextControl,
    querySelectorAll(selector) {
      if (selector.includes('absolute') || selector.includes('fixed')) return [];
      return [input, nextControl];
    },
    matches: () => false
  };
  context.document.activeElement = input;
  state.current = input;
  state.previousScope = context.document.body;

  assert.equal(closeCurrentLayer(), true);
  assert.equal(context.document.activeElement, nextControl);
  assert.equal(state.current, nextControl);
  assert.equal(input.classList.contains('goated-tv-focused'), false);
  assert.equal(nextControl.classList.contains('goated-tv-focused'), true);
});
