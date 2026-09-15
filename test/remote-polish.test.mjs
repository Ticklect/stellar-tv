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
    },
    toString() {
      return [...values].join(' ');
    }
  };
}

function loadModuleInternals() {
  const source = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  const marker = '})();';
  const exportHook = `
    globalThis.__remotePolishInternals = {
      candidateMutationAffectsCache:
        typeof candidateMutationAffectsCache === 'function' ? candidateMutationAffectsCache : null,
      isVisible: isVisible,
      rememberFocusForScope:
        typeof rememberFocusForScope === 'function' ? rememberFocusForScope : null,
      rememberedFocusForScope:
        typeof rememberedFocusForScope === 'function' ? rememberedFocusForScope : null,
      setFocus: setFocus,
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
    }
  };
  document.body = {
    contains: () => true,
    querySelectorAll: () => [],
    matches: () => false
  };
  document.activeElement = document.body;

  const window = {
    addEventListener() {},
    console: { warn() {} },
    innerHeight: 540,
    innerWidth: 960,
    location: { pathname: '/' },
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
  return { ...context.__remotePolishInternals, context };
}

function makeElement(context, options = {}) {
  const attributes = { ...(options.attributes || {}) };
  const classList = makeClassList(options.classes || []);
  const element = {
    classList,
    children: [],
    disabled: Boolean(options.disabled),
    isConnected: options.isConnected !== false,
    parentElement: options.parentElement || null,
    tagName: options.tagName || 'BUTTON',
    contains(node) {
      return node === element;
    },
    focus() {
      context.document.activeElement = element;
    },
    getAttribute(name) {
      if (name === 'class') return classList.toString();
      return Object.prototype.hasOwnProperty.call(attributes, name) ? attributes[name] : null;
    },
    hasAttribute(name) {
      return Object.prototype.hasOwnProperty.call(attributes, name);
    },
    setAttribute(name, value) {
      attributes[name] = String(value);
    },
    getBoundingClientRect() {
      return { left: 20, top: 20, right: 120, bottom: 60, width: 100, height: 40 };
    },
    matches() {
      return true;
    },
    querySelector() {
      return null;
    }
  };
  return element;
}

test('does not leave ghost focus when the browser refuses DOM focus', () => {
  const { context, setFocus, state } = loadModuleInternals();
  const target = makeElement(context, { tagName: 'DIV' });
  target.focus = () => {};
  target.contains = () => false;
  state.current = null;
  context.document.activeElement = context.document.body;

  assert.equal(setFocus(target), false);
  assert.equal(state.current, null);
  assert.equal(target.classList.contains('goated-tv-focused'), false);
});

test('treats aria-disabled controls and controls inside hidden layers as non-focusable', () => {
  const { context, isVisible } = loadModuleInternals();
  const ariaDisabled = makeElement(context, {
    attributes: { 'aria-disabled': 'true' }
  });
  assert.equal(isVisible(ariaDisabled), false);

  const hiddenLayer = makeElement(context, {
    attributes: { 'aria-hidden': 'true' },
    tagName: 'DIV'
  });
  const hiddenChild = makeElement(context, { parentElement: hiddenLayer });
  assert.equal(isVisible(hiddenChild), false);

  const inertLayer = makeElement(context, {
    attributes: { inert: '' },
    tagName: 'DIV'
  });
  const inertChild = makeElement(context, { parentElement: inertLayer });
  assert.equal(isVisible(inertChild), false);
});

test('invalidates focus candidates for app visibility changes but ignores TV focus decoration', () => {
  const { candidateMutationAffectsCache } = loadModuleInternals();
  assert.equal(typeof candidateMutationAffectsCache, 'function');

  const target = {
    getAttribute(name) {
      return name === 'class' ? 'poster selected' : null;
    }
  };
  assert.equal(
    candidateMutationAffectsCache({
      type: 'attributes',
      attributeName: 'class',
      oldValue: 'poster',
      target
    }),
    true
  );

  const focusOnlyTarget = {
    getAttribute(name) {
      return name === 'class' ? 'poster goated-tv-focused' : null;
    }
  };
  assert.equal(
    candidateMutationAffectsCache({
      type: 'attributes',
      attributeName: 'class',
      oldValue: 'poster',
      target: focusOnlyTarget
    }),
    false
  );

  assert.equal(
    candidateMutationAffectsCache({
      type: 'attributes',
      attributeName: 'style',
      oldValue: 'display:none',
      target: { getAttribute: () => 'display:block' }
    }),
    true
  );
  assert.equal(
    candidateMutationAffectsCache({
      type: 'attributes',
      attributeName: 'aria-disabled',
      oldValue: 'true',
      target: { getAttribute: () => 'false' }
    }),
    true
  );
});

test('remembers focus independently for nested remote-control scopes', () => {
  const { context, rememberFocusForScope, rememberedFocusForScope, state } = loadModuleInternals();
  assert.equal(typeof rememberFocusForScope, 'function');
  assert.equal(typeof rememberedFocusForScope, 'function');

  const outerScope = { contains: (element) => element === outerFocus };
  const innerScope = { contains: (element) => element === innerFocus };
  const outerFocus = makeElement(context);
  const innerFocus = makeElement(context);

  state.focusMemory = new WeakMap();
  rememberFocusForScope(outerScope, outerFocus);
  rememberFocusForScope(innerScope, innerFocus);

  assert.equal(rememberedFocusForScope(outerScope), outerFocus);
  assert.equal(rememberedFocusForScope(innerScope), innerFocus);
});

test('Android remote dispatch avoids optional chaining in injected WebView JavaScript', () => {
  const activity = fs.readFileSync(
    new URL(
      '../android-tv/app/src/main/java/io/github/ticklect/goatedtv/MainActivity.kt',
      import.meta.url
    ),
    'utf8'
  );

  assert.doesNotMatch(activity, /__goatedAndroidTvDispatch\?\./);
  assert.match(activity, /typeof window\.__goatedAndroidTvDispatch/);
});
