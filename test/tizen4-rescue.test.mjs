import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadRescueInternals() {
  const source = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  const marker = '})();';
  const exportHook = `
    globalThis.__tizen4RescueInternals = {
      isTizen4RescueMode:
        typeof isTizen4RescueMode === 'function' ? isTizen4RescueMode : null,
      isTizen4InternalHref:
        typeof isTizen4InternalHref === 'function' ? isTizen4InternalHref : null,
      tizen4RescueCss:
        typeof tizen4RescueCss === 'function' ? tizen4RescueCss : null
    };
  `;
  const instrumented = source.slice(0, source.lastIndexOf(marker)) + exportHook + marker;
  const document = {
    activeElement: null,
    body: null,
    readyState: 'loading',
    addEventListener() {}
  };
  document.body = {
    contains: () => true,
    querySelectorAll: () => [],
    matches: () => false
  };
  const window = {
    addEventListener() {},
    console: { warn() {} },
    location: { pathname: '/' },
    scrollTo() {}
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
  return context.__tizen4RescueInternals;
}

const rescue = loadRescueInternals();

test('Tizen 4 rescue mode is narrowly scoped to Chromium-56-era Stellar TVs', () => {
  assert.equal(typeof rescue.isTizen4RescueMode, 'function');
  assert.equal(
    rescue.isTizen4RescueMode(
      'Mozilla/5.0 (SMART-TV; Linux; Tizen 4.0) AppleWebKit/537.36 Chrome/56.0.2924.0 TV Safari/537.36',
      'stellar.gdn'
    ),
    true
  );
  assert.equal(
    rescue.isTizen4RescueMode(
      'Mozilla/5.0 (SMART-TV; Linux; Tizen 4.1) AppleWebKit/537.36 Chrome/56.0.2924.0 TV Safari/537.36',
      'stellar.gdn'
    ),
    false
  );
  assert.equal(
    rescue.isTizen4RescueMode(
      'Mozilla/5.0 (SMART-TV; Linux; Tizen 5.5) AppleWebKit/537.36 Chrome/69.0.3497.106 TV Safari/537.36',
      'stellar.gdn'
    ),
    false
  );
  assert.equal(
    rescue.isTizen4RescueMode(
      'Mozilla/5.0 (SMART-TV; Linux; Tizen 4.0) AppleWebKit/537.36 Chrome/56.0.2924.0 TV Safari/537.36',
      'example.com'
    ),
    false
  );
  assert.equal(
    rescue.isTizen4RescueMode(
      'Mozilla/5.0 (SMART-TV; Linux; Web0S) AppleWebKit/537.36 Chrome/56.0.2924.0 Safari/537.36',
      'stellar.gdn'
    ),
    false
  );
});

test('Tizen 4 rescue mode recognizes only safe same-site navigation hrefs', () => {
  assert.equal(typeof rescue.isTizen4InternalHref, 'function');
  assert.equal(rescue.isTizen4InternalHref('/movie/550', 'stellar.gdn'), true);
  assert.equal(rescue.isTizen4InternalHref('/search?q=alien', 'stellar.gdn'), true);
  assert.equal(rescue.isTizen4InternalHref('title/550', 'stellar.gdn'), true);
  assert.equal(rescue.isTizen4InternalHref('https://stellar.gdn/tv/1399', 'stellar.gdn'), true);
  assert.equal(rescue.isTizen4InternalHref('//stellar.gdn/anime/1', 'stellar.gdn'), true);
  assert.equal(rescue.isTizen4InternalHref('#details', 'stellar.gdn'), false);
  assert.equal(rescue.isTizen4InternalHref('javascript:alert(1)', 'stellar.gdn'), false);
  assert.equal(rescue.isTizen4InternalHref('mailto:test@example.com', 'stellar.gdn'), false);
  assert.equal(rescue.isTizen4InternalHref('http://stellar.gdn/movie/550', 'stellar.gdn'), false);
  assert.equal(rescue.isTizen4InternalHref('https://example.com/movie/550', 'stellar.gdn'), false);
  assert.equal(rescue.isTizen4InternalHref('//example.com/movie/550', 'stellar.gdn'), false);
});

test('Tizen 4 rescue stylesheet stays inside Chromium 56 CSS capabilities', () => {
  assert.equal(typeof rescue.tizen4RescueCss, 'function');
  const css = rescue.tizen4RescueCss();
  assert.match(css, /goated-tizen4-rescue/);
  assert.match(css, /goated-tizen4-card/);
  assert.match(css, /display:\s*inline-block/);
  assert.match(css, /goated-tizen4-card img[^}]*position:\s*static/i);
  assert.doesNotMatch(
    css,
    /@layer|@property|color-mix|aspect-ratio|backdrop-filter|\bgap\s*:|\bdvh\b|display\s*:\s*grid/i
  );
});
