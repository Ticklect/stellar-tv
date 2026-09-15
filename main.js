// SPDX-License-Identifier: LGPL-3.0-only
// Copyright (C) 2026 Ticklect contributors

(function () {
  'use strict';

  if (window.top !== window.self) return;

  var MODULE_VERSION = '1.0.0';
  var diagnostics = {
    version: MODULE_VERSION,
    lastError: null
  };
  window.__goatedTizenBrewDiagnostics = diagnostics;

  function reportError(area, error) {
    var message = error && error.message ? error.message : String(error || 'Unknown error');
    diagnostics.lastError = {
      area: area,
      message: message,
      timestamp: new Date().toISOString()
    };
    if (window.console && typeof window.console.warn === 'function') {
      window.console.warn('[Goated TizenBrew][' + area + '] ' + message);
    }
  }

  function disableTizenSiteAds() {
    var userAgent = navigator.userAgent || '';
    if (!/Tizen/i.test(userAgent) || location.hostname !== 'stellar.gdn') return false;

    try {
      if (!window.localStorage) return false;
      var rawSettings = window.localStorage.getItem('site_settings');
      var settings = {};
      if (rawSettings) {
        try {
          settings = JSON.parse(rawSettings);
        } catch (error) {
          reportError('site-settings-parse', error);
          settings = {};
        }
      }
      if (!settings || typeof settings !== 'object' || Array.isArray(settings)) settings = {};
      if (settings.enableAdsV2 === false) return false;

      settings.enableAdsV2 = false;
      window.localStorage.setItem('site_settings', JSON.stringify(settings));
      if (window.location && typeof window.location.reload === 'function') window.location.reload();
      return true;
    } catch (error) {
      reportError('site-ad-setting', error);
      return false;
    }
  }

  if (disableTizenSiteAds()) return;

  function isTizen4RescueMode(userAgent, hostname) {
    return (
      String(hostname || '').toLowerCase() === 'stellar.gdn' &&
      /(?:^|[\s;(])Tizen\s+4(?:\.0)?(?:[\s;)]|$)/i.test(String(userAgent || ''))
    );
  }

  function isTizen4InternalHref(href, hostname) {
    var value = String(href || '').replace(/^\s+|\s+$/g, '');
    var expectedHost = String(hostname || '').toLowerCase();
    if (!value || value.charAt(0) === '#') return false;
    if (/^(?:javascript|mailto|tel|data):/i.test(value)) return false;
    if (value.charAt(0) === '/' && value.charAt(1) !== '/') return true;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(value) && value.indexOf('//') !== 0) return true;

    var match = value.match(/^(?:https:)?\/\/([^/:?#]+)(?::\d+)?(?:[/?#]|$)/i);
    return !!match && match[1].toLowerCase() === expectedHost;
  }

  function tizen4RescueCss() {
    return [
      'html.goated-tizen4-rescue { background: #05070b !important; color: #fff !important; }',
      'html.goated-tizen4-rescue body { margin: 0 !important; background: #05070b !important; color: #fff !important; font-family: Arial, Helvetica, sans-serif !important; font-size: 18px !important; line-height: 1.4 !important; overflow-x: hidden !important; }',
      'html.goated-tizen4-rescue *, html.goated-tizen4-rescue *:before, html.goated-tizen4-rescue *:after { box-sizing: border-box; }',
      'html.goated-tizen4-rescue header { position: relative !important; top: auto !important; left: auto !important; right: auto !important; display: block !important; width: 100% !important; min-height: 72px; padding: 18px 32px !important; background: #0b0e14 !important; border-bottom: 1px solid #252a35 !important; z-index: 20; }',
      'html.goated-tizen4-rescue nav { display: block !important; width: 100% !important; }',
      'html.goated-tizen4-rescue header a, html.goated-tizen4-rescue nav a { display: inline-block; margin: 4px 18px 4px 0; color: #fff !important; text-decoration: none !important; }',
      'html.goated-tizen4-rescue main { display: block !important; width: 100% !important; max-width: none !important; padding: 28px 40px 60px !important; }',
      'html.goated-tizen4-rescue section { display: block !important; width: 100% !important; margin: 0 0 36px !important; padding: 0 !important; clear: both; }',
      'html.goated-tizen4-rescue h1, html.goated-tizen4-rescue h2, html.goated-tizen4-rescue h3 { display: block !important; margin: 12px 0 18px !important; color: #fff !important; line-height: 1.2 !important; }',
      'html.goated-tizen4-rescue h1 { font-size: 38px !important; }',
      'html.goated-tizen4-rescue h2 { font-size: 28px !important; }',
      'html.goated-tizen4-rescue h3 { font-size: 22px !important; }',
      'html.goated-tizen4-rescue a[href] { color: inherit; text-decoration: none; }',
      'html.goated-tizen4-rescue img { max-width: 100%; }',
      'html.goated-tizen4-rescue button, html.goated-tizen4-rescue input, html.goated-tizen4-rescue select, html.goated-tizen4-rescue textarea, html.goated-tizen4-rescue [role="button"] { min-height: 44px; padding: 10px 16px; font-size: 18px; color: #fff; background: #171b24; border: 1px solid #3a4150; border-radius: 7px; }',
      'html.goated-tizen4-rescue [hidden], html.goated-tizen4-rescue [aria-hidden="true"], html.goated-tizen4-rescue [class~="hidden"] { display: none !important; }',
      'html.goated-tizen4-rescue [class~="flex"] { display: flex !important; }',
      'html.goated-tizen4-rescue [class~="inline-flex"] { display: inline-flex !important; }',
      'html.goated-tizen4-rescue [class~="flex-col"] { flex-direction: column !important; }',
      'html.goated-tizen4-rescue [class~="items-center"] { align-items: center !important; }',
      'html.goated-tizen4-rescue [class~="justify-center"] { justify-content: center !important; }',
      'html.goated-tizen4-rescue [class~="justify-between"] { justify-content: space-between !important; }',
      'html.goated-tizen4-rescue [class~="w-full"] { width: 100% !important; }',
      'html.goated-tizen4-rescue [class~="grid"] { display: block !important; }',
      'html.goated-tizen4-rescue .goated-tizen4-rail, html.goated-tizen4-rescue [class~="overflow-x-auto"] { display: block !important; width: 100% !important; overflow-x: auto !important; overflow-y: hidden !important; white-space: nowrap !important; padding: 14px 4px 26px !important; margin: 0 0 24px !important; }',
      'html.goated-tizen4-rescue .goated-tizen4-rail > * { display: inline-block !important; vertical-align: top !important; white-space: normal !important; }',
      'html.goated-tizen4-rescue .goated-tizen4-card { display: inline-block !important; width: 176px !important; min-width: 176px !important; max-width: 176px !important; margin: 0 14px 18px 0 !important; vertical-align: top !important; white-space: normal !important; color: #fff !important; }',
      'html.goated-tizen4-rescue .goated-tizen4-card img { position: static !important; top: auto !important; right: auto !important; bottom: auto !important; left: auto !important; display: block !important; width: 176px !important; height: 264px !important; object-fit: cover !important; border-radius: 10px !important; background: #171b24 !important; }',
      'html.goated-tizen4-rescue .goated-tizen4-card:focus, html.goated-tizen4-rescue .goated-tizen4-card.goated-tv-focused { outline: 5px solid #fff !important; outline-offset: 4px !important; box-shadow: 0 0 0 3px #000, 0 12px 28px rgba(0,0,0,.75) !important; }',
      '@media (min-width: 640px) { html.goated-tizen4-rescue [class~="sm:flex"] { display: flex !important; } html.goated-tizen4-rescue [class~="sm:block"] { display: block !important; } }',
      '@media (min-width: 768px) { html.goated-tizen4-rescue [class~="md:flex"] { display: flex !important; } html.goated-tizen4-rescue [class~="md:block"] { display: block !important; } html.goated-tizen4-rescue [class~="md:inline-flex"] { display: inline-flex !important; } }',
      '@media (min-width: 1024px) { html.goated-tizen4-rescue [class~="lg:flex"] { display: flex !important; } html.goated-tizen4-rescue [class~="lg:block"] { display: block !important; } html.goated-tizen4-rescue [class~="lg:inline-flex"] { display: inline-flex !important; } }'
    ].join('\n');
  }

  function nearestTizen4Anchor(target) {
    var node = target;
    while (node && node !== document.body && node !== document.documentElement) {
      if (node.tagName === 'A' && node.getAttribute) return node;
      node = node.parentElement;
    }
    return null;
  }

  function tizen4PosterRail(anchor) {
    var parent = anchor && anchor.parentElement;
    var depth = 0;
    while (parent && parent !== document.body && parent !== document.documentElement && depth < 5) {
      if (/^(DIV|UL|OL)$/.test(parent.tagName || '') && parent.querySelectorAll) {
        var posterImages = parent.querySelectorAll('a[href] img');
        if (posterImages.length >= 2 && posterImages.length <= 60) return parent;
      }
      parent = parent.parentElement;
      depth += 1;
    }
    return null;
  }

  function applyTizen4RescueClasses(root) {
    if (!root || root.nodeType !== 1) return;
    var anchors =
      root.tagName === 'A' ? [root] : Array.prototype.slice.call(root.querySelectorAll('a[href]'));
    anchors.forEach(function (anchor) {
      var href = anchor.getAttribute('href');
      if (!isTizen4InternalHref(href, location.hostname)) return;
      if (!anchor.querySelector || !anchor.querySelector('img')) return;
      anchor.classList.add('goated-tizen4-card');
      var rail = tizen4PosterRail(anchor);
      if (rail) rail.classList.add('goated-tizen4-rail');
    });
  }

  function installTizen4RescueMode() {
    if (!isTizen4RescueMode(navigator.userAgent || '', location.hostname)) return false;
    if (window.__goatedTizen4Rescue) return true;
    window.__goatedTizen4Rescue = true;
    diagnostics.tizen4Rescue = true;
    document.documentElement.classList.add('goated-tizen4-rescue');

    if (!document.getElementById('goated-tizen4-rescue-style')) {
      var style = document.createElement('style');
      style.id = 'goated-tizen4-rescue-style';
      style.textContent = tizen4RescueCss();
      (document.head || document.documentElement).appendChild(style);
    }

    applyTizen4RescueClasses(document.documentElement);
    document.addEventListener(
      'click',
      function (event) {
        if (
          event.defaultPrevented ||
          (typeof event.button === 'number' && event.button !== 0) ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        )
          return;
        var anchor = nearestTizen4Anchor(event.target);
        if (!anchor || anchor.hasAttribute('download')) return;
        if (anchor.target && anchor.target !== '_self') return;
        var href = anchor.getAttribute('href');
        if (!isTizen4InternalHref(href, location.hostname)) return;

        event.preventDefault();
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
        else event.stopPropagation();
        window.location.href = anchor.href || href;
      },
      true
    );
    return true;
  }

  var tizen4RescueActive = isTizen4RescueMode(navigator.userAgent || '', location.hostname);

  function monotonicNow() {
    return window.performance && typeof window.performance.now === 'function'
      ? window.performance.now()
      : Date.now();
  }

  function markActivationRoute() {
    var activation = diagnostics.lastActivation;
    if (!activation || activation.routeAt !== null) return;
    activation.routeAt = monotonicNow();
    activation.routeDelayMs = activation.routeAt - activation.clickAt;
    activation.pathAfter = window.location.pathname;
  }

  var POW_K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function powHashHasPrefix(message, difficulty, words) {
    var index;
    for (index = 0; index < 16; index++) words[index] = 0;
    for (index = 0; index < message.length; index++) {
      words[index >> 2] |= message.charCodeAt(index) << (24 - (index % 4) * 8);
    }
    words[message.length >> 2] |= 0x80 << (24 - (message.length % 4) * 8);
    words[15] = message.length * 8;

    for (index = 16; index < 64; index++) {
      var x = words[index - 15];
      var y = words[index - 2];
      var sigma0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
      var sigma1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
      words[index] = (words[index - 16] + sigma0 + words[index - 7] + sigma1) | 0;
    }

    var a = 0x6a09e667;
    var b = 0xbb67ae85;
    var c = 0x3c6ef372;
    var d = 0xa54ff53a;
    var e = 0x510e527f;
    var f = 0x9b05688c;
    var g = 0x1f83d9ab;
    var h = 0x5be0cd19;
    for (index = 0; index < 64; index++) {
      var bigSigma1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      var choose = (e & f) ^ (~e & g);
      var temp1 = (h + bigSigma1 + choose + POW_K[index] + words[index]) | 0;
      var bigSigma0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      var majority = (a & b) ^ (a & c) ^ (b & c);
      var temp2 = (bigSigma0 + majority) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    var hashWords = [
      (a + 0x6a09e667) >>> 0,
      (b + 0xbb67ae85) >>> 0,
      (c + 0x3c6ef372) >>> 0,
      (d + 0xa54ff53a) >>> 0,
      (e + 0x510e527f) >>> 0,
      (f + 0x9b05688c) >>> 0,
      (g + 0x1f83d9ab) >>> 0,
      (h + 0x5be0cd19) >>> 0
    ];
    for (index = 0; index < difficulty; index++) {
      var hashWord = hashWords[Math.floor(index / 8)];
      if (((hashWord >>> (28 - (index % 8) * 4)) & 15) !== 0) return false;
    }
    return true;
  }

  function powWorkerMain() {
    self.onmessage = function (event) {
      var data = event.data;
      var words = new Int32Array(64);
      for (var nonce = data.start; nonce <= data.maximum; nonce += data.step) {
        if (powHashHasPrefix(data.challenge + nonce, data.difficulty, words)) {
          self.postMessage({ nonce: String(nonce) });
          return;
        }
      }
      self.postMessage({ error: 'Proof-of-work timed out' });
    };
  }

  function solveProofInWorkers(challenge, difficulty) {
    return new Promise(function (resolve, reject) {
      var source =
        'var POW_K=' +
        JSON.stringify(POW_K) +
        ';' +
        powHashHasPrefix.toString() +
        ';(' +
        powWorkerMain.toString() +
        ')();';
      var objectUrl;
      var workers = [];
      var settled = false;
      var exhaustedWorkers = 0;
      var timer;
      function finish(error, nonce) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        workers.forEach(function (worker) {
          worker.terminate();
        });
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        if (error) reject(error);
        else resolve(nonce);
      }
      try {
        objectUrl = URL.createObjectURL(new Blob([source], { type: 'application/javascript' }));
        var workerCount = 1;
        for (var workerIndex = 0; workerIndex < workerCount; workerIndex++) {
          var worker = new Worker(objectUrl);
          workers.push(worker);
          worker.onmessage = function (event) {
            if (event.data && event.data.nonce !== undefined) finish(null, event.data.nonce);
            else if (event.data && event.data.error) {
              exhaustedWorkers += 1;
              if (exhaustedWorkers === workerCount) finish(new Error(event.data.error));
            }
          };
          worker.onerror = function () {
            finish(new Error('Background proof worker failed'));
          };
          worker.postMessage({
            challenge: challenge,
            difficulty: difficulty,
            start: workerIndex,
            step: workerCount,
            maximum: 5000000
          });
        }
        timer = setTimeout(function () {
          finish(new Error('Background proof timed out'));
        }, 14000);
      } catch (error) {
        finish(error);
      }
    });
  }

  function installSourceResolverAcceleration() {
    var userAgent = navigator.userAgent || '';
    if (!/Tizen|SMART-TV/i.test(userAgent) || location.hostname !== 'stellar.gdn') return;
    if (window.__goatedTvSourceBoost || typeof window.fetch !== 'function') return;
    window.__goatedTvSourceBoost = true;
    var nativeFetch = window.fetch.bind(window);
    var proofs = {};

    window.fetch = function (input, init) {
      var requestUrl = typeof input === 'string' ? input : (input && input.url) || '';
      if (/^https:\/\/api\.reallyfast\.xyz\/api\/challenge(?:\?|$)/.test(requestUrl)) {
        return nativeFetch(input, init).then(function (response) {
          return response
            .clone()
            .json()
            .then(function (data) {
              if (!data || !data.challenge || !data.difficulty) return response;
              proofs[data.challenge] = solveProofInWorkers(data.challenge, Number(data.difficulty));
              proofs[data.challenge].catch(function (error) {
                reportError('source-proof', error);
              });
              var accelerated = {};
              Object.keys(data).forEach(function (key) {
                accelerated[key] = data[key];
              });
              accelerated.difficulty = 0;
              return new Response(JSON.stringify(accelerated), {
                status: response.status,
                statusText: response.statusText,
                headers: { 'Content-Type': 'application/json' }
              });
            })
            .catch(function (error) {
              reportError('challenge-response', error);
              return response;
            });
        });
      }

      if (
        /^https:\/\/api\.reallyfast\.xyz\/api\/(?:resolve|subtitles)(?:\?|$)/.test(requestUrl) &&
        init &&
        init.body
      ) {
        try {
          var body = JSON.parse(init.body);
          var proof = body.challenge && proofs[body.challenge];
          if (proof) {
            return proof.then(function (nonce) {
              var acceleratedInit = {};
              Object.keys(init).forEach(function (key) {
                acceleratedInit[key] = init[key];
              });
              body.nonce = nonce;
              acceleratedInit.body = JSON.stringify(body);
              delete proofs[body.challenge];
              return nativeFetch(input, acceleratedInit);
            });
          }
        } catch (error) {
          reportError('source-request', error);
        }
      }
      return nativeFetch(input, init);
    };
  }

  installSourceResolverAcceleration();

  var STYLE_ID = 'goated-tv-navigation-style';
  var FOCUS_CLASS = 'goated-tv-focused';
  var FOCUS_SURFACE_CLASS = 'goated-tv-focus-surface';
  var VIDEO_CARD_CLASS = 'goated-tv-video-card';
  var VIDEO_RAIL_CLASS = 'goated-tv-video-rail';
  var FOCUS_OUTSET = 9;
  var FOCUS_GUTTER = 16;
  var isAndroidTv = /GoatedAndroidTV/i.test(navigator.userAgent || '');
  var SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[role="button"]',
    '[role="link"]',
    '[role="slider"]',
    '[role="switch"]',
    '[role="tab"]',
    '[role="menuitem"]',
    '[role="option"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="combobox"]',
    '[contenteditable="true"]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  var state = {
    current: null,
    preferredX: null,
    previousScope: null,
    previousFocus: null,
    focusMemory: typeof WeakMap === 'function' ? new WeakMap() : null,
    mutationTimer: null,
    domVersion: 0,
    candidateCache: typeof WeakMap === 'function' ? new WeakMap() : null,
    focusSurface: null,
    userInteracted: false,
    started: false,
    path: window.location.pathname
  };

  function rectOf(element) {
    return element.getBoundingClientRect();
  }

  function centerOf(element) {
    var rect = rectOf(element);
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function scrollDeltaForVisibility(itemStart, itemEnd, visibleStart, visibleEnd) {
    if (itemStart < visibleStart) return itemStart - visibleStart;
    if (itemEnd > visibleEnd) return itemEnd - visibleEnd;
    return 0;
  }

  function scrollRootTo(top) {
    window.scrollTo(0, Math.max(0, top));
  }

  function rootScrollElement() {
    return document.scrollingElement || document.documentElement || document.body;
  }

  function isScrollableOverflow(value) {
    return /^(auto|scroll|overlay)$/.test(value || '');
  }

  function verticalScrollOwner(element) {
    var parent = element && element.parentElement;
    while (parent && parent !== document.body && parent !== document.documentElement) {
      var style = window.getComputedStyle(parent);
      if (isScrollableOverflow(style.overflowY) && parent.scrollHeight > parent.clientHeight + 1) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  function fixedHeaderBottom() {
    var headers = Array.prototype.slice.call(document.querySelectorAll('header'));
    return headers.reduce(function (bottom, header) {
      if (!isVisible(header)) return bottom;
      var position = window.getComputedStyle(header).position;
      if (position !== 'fixed' && position !== 'sticky') return bottom;
      var rect = rectOf(header);
      if (rect.top > window.innerHeight * 0.25 || rect.bottom <= 0) return bottom;
      return Math.max(bottom, rect.bottom);
    }, 0);
  }

  function isHomeHeroPrimary(element) {
    if (!isAndroidTv || window.location.pathname !== '/' || activeScope() !== document.body)
      return false;
    if (!/^(Play|Resume\b|Watch\b|Maybe later$)/i.test(controlLabel(element))) return false;
    var hero = element.closest && element.closest('section');
    if (!hero) return false;
    var root = rootScrollElement();
    return Math.abs(rectOf(hero).top + (root ? root.scrollTop : window.scrollY || 0)) <= 24;
  }

  function isVideoCard(element) {
    if (!element || !element.querySelector || !element.querySelector('img, video')) return false;
    var identity = controlLabel(element) + ' ' + String(element.className || '');
    if (!/(trailer|teaser|\bclip\b|group\/video)/i.test(identity)) return false;
    var rect = rectOf(element);
    if (!rect.height) return false;
    var ratio = rect.width / rect.height;
    return ratio >= 1.35 && ratio <= 2.15;
  }

  function decorateVideoRail(element) {
    if (!isAndroidTv || !isVideoCard(element)) return;
    var rail = railFor(element);
    if (!rail) return;
    element.classList.add(VIDEO_CARD_CLASS);
    rail.classList.add(VIDEO_RAIL_CLASS);
  }

  function isHiddenByAncestor(element) {
    var node = element;
    while (node) {
      if (
        node.hidden ||
        (node.hasAttribute && node.hasAttribute('hidden')) ||
        (node.hasAttribute && node.hasAttribute('inert')) ||
        (node.getAttribute && node.getAttribute('aria-hidden') === 'true')
      )
        return true;
      node = node.parentElement;
    }
    return false;
  }

  function isVisible(element) {
    if (!element || !element.isConnected || element.disabled) return false;
    if (element.getAttribute('aria-disabled') === 'true' || isHiddenByAncestor(element)) return false;
    var rect = rectOf(element);
    if (rect.width < 2 || rect.height < 2) return false;
    var style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.visibility !== 'collapse'
    );
  }

  function numericZIndex(element) {
    var value = parseInt(window.getComputedStyle(element).zIndex, 10);
    return isNaN(value) ? 0 : value;
  }

  function isSideDrawerRect(rect, viewportWidth, viewportHeight) {
    return (
      rect.width >= viewportWidth * 0.3 &&
      rect.width <= viewportWidth * 0.65 &&
      rect.height >= viewportHeight * 0.8 &&
      (rect.left <= viewportWidth * 0.05 || rect.right >= viewportWidth * 0.95)
    );
  }

  function activeScope() {
    var dialogs = Array.prototype.slice
      .call(document.querySelectorAll('[role="dialog"][aria-modal="true"]'))
      .filter(isVisible);
    if (dialogs.length) {
      dialogs.sort(function (a, b) {
        return numericZIndex(a) - numericZIndex(b);
      });
      return dialogs[dialogs.length - 1];
    }

    var sideDrawers = Array.prototype.slice
      .call(document.body.querySelectorAll('[class*="absolute"], [style*="position: absolute"]'))
      .filter(function (element) {
        if (!isVisible(element) || window.getComputedStyle(element).position !== 'absolute')
          return false;
        var rect = rectOf(element);
        return (
          isSideDrawerRect(rect, window.innerWidth, window.innerHeight) &&
          !!element.querySelector(SELECTOR)
        );
      });
    if (sideDrawers.length) {
      sideDrawers.sort(function (a, b) {
        var aRect = rectOf(a);
        var bRect = rectOf(b);
        return bRect.width * bRect.height - aRect.width * aRect.height;
      });
      return sideDrawers[sideDrawers.length - 1];
    }

    var overlaySelector = '[class*="fixed"], [style*="position: fixed"], [style*="position:fixed"]';
    var fixedOverlays = Array.prototype.slice
      .call(document.body.querySelectorAll(overlaySelector))
      .filter(function (element) {
        if (!isVisible(element)) return false;
        var style = window.getComputedStyle(element);
        if (style.position !== 'fixed' || numericZIndex(element) < 60) return false;
        var rect = rectOf(element);
        var isFullOverlay =
          rect.width >= window.innerWidth * 0.7 && rect.height >= window.innerHeight * 0.7;
        var isSideDrawer = isSideDrawerRect(rect, window.innerWidth, window.innerHeight);
        if (!isFullOverlay && !isSideDrawer) return false;
        return !!element.querySelector(SELECTOR);
      });
    fixedOverlays.sort(function (a, b) {
      return numericZIndex(a) - numericZIndex(b);
    });
    return fixedOverlays.length ? fixedOverlays[fixedOverlays.length - 1] : document.body;
  }

  function isUtilityControl(element) {
    var label = (element.getAttribute('aria-label') || '').trim();
    return /^Scroll (left|right)$/i.test(label) || /^Show featured title/i.test(label);
  }

  function hasInteractiveAncestor(element, scope) {
    var parent = element.parentElement;
    var elementRect = rectOf(element);
    while (parent && parent !== scope && parent !== document.body) {
      if (parent.matches && parent.matches(SELECTOR) && isVisible(parent)) {
        var parentRect = rectOf(parent);
        var sameBox =
          Math.abs(parentRect.left - elementRect.left) < 2 &&
          Math.abs(parentRect.top - elementRect.top) < 2 &&
          Math.abs(parentRect.width - elementRect.width) < 2 &&
          Math.abs(parentRect.height - elementRect.height) < 2;
        if (sameBox || parent.tagName === 'BUTTON' || parent.tagName === 'A') return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  function candidates(scope) {
    scope = scope || activeScope();
    if (state.candidateCache) {
      var cached = state.candidateCache.get(scope);
      if (cached && cached.version === state.domVersion) return cached.items;
    }
    var found = Array.prototype.slice.call(scope.querySelectorAll(SELECTOR));
    if (scope.matches && scope.matches(SELECTOR)) found.unshift(scope);
    found.forEach(decorateVideoRail);
    var items = found.filter(function (element, index, all) {
      return (
        isVisible(element) &&
        !isUtilityControl(element) &&
        !hasInteractiveAncestor(element, scope) &&
        all.indexOf(element) === index
      );
    });
    if (state.candidateCache)
      state.candidateCache.set(scope, { version: state.domVersion, items: items });
    return items;
  }

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.' + FOCUS_CLASS + ' {',
      '  outline: 5px solid #fff !important;',
      '  outline-offset: 4px !important;',
      '  box-shadow: 0 0 0 3px rgba(0,0,0,.85), 0 14px 35px rgba(0,0,0,.65) !important;',
      '  border-radius: 8px;',
      '}',
      'html.goated-android-tv .' + FOCUS_SURFACE_CLASS + ' {',
      '  outline: 4px solid #fff !important;',
      '  outline-offset: -4px !important;',
      '  box-shadow: inset 0 0 0 4px #fff, inset 0 0 0 7px rgba(0,0,0,.78), 0 10px 28px rgba(0,0,0,.7) !important;',
      '  filter: brightness(1.08);',
      '}',
      'input.' + FOCUS_CLASS + ', textarea.' + FOCUS_CLASS + ', select.' + FOCUS_CLASS + ' {',
      '  transform: none !important;',
      '}',
      'html.goated-android-tv input[type="range"] {',
      '  width: 100%;',
      '  min-width: 0;',
      '  max-width: 100%;',
      '  min-height: 28px;',
      '}',
      'html.goated-android-tv input[type="range"].' + FOCUS_CLASS + ' {',
      '  outline: none !important;',
      '  box-shadow: none !important;',
      '  filter: brightness(1.35) drop-shadow(0 0 7px rgba(255,255,255,.8));',
      '}',
      'html.goated-android-tv input[type="range"].' + FOCUS_CLASS + '::-webkit-slider-thumb {',
      '  box-shadow: 0 0 0 4px #fff, 0 0 0 7px rgba(0,0,0,.8) !important;',
      '}',
      '.' + FOCUS_CLASS + ' img { filter: brightness(1.08); }',
      'html.goated-tv-mode, html.goated-tv-mode * { scroll-behavior: auto !important; }',
      'html.goated-tv-mode [class*="backdrop-blur"] {',
      '  -webkit-backdrop-filter: none !important;',
      '  backdrop-filter: none !important;',
      '}',
      'html.goated-tv-mode [class*="transition"] { transition-duration: 80ms !important; }',
      'html.goated-tv-mode .row-scroll, html.goated-tv-mode [class*="overflow-x-auto"] {',
      '  content-visibility: auto;',
      '  contain-intrinsic-size: auto 280px;',
      '}',
      'html.goated-android-tv .' + VIDEO_RAIL_CLASS + ' {',
      '  box-sizing: border-box;',
      '  padding-block: ' + (FOCUS_OUTSET + 3) + 'px !important;',
      '  padding-inline: ' + (FOCUS_OUTSET + 3) + 'px !important;',
      '  scroll-padding-inline: ' + FOCUS_GUTTER + 'px;',
      '}',
      'html.goated-android-tv .' + VIDEO_CARD_CLASS + ' {',
      '  scroll-margin: ' + FOCUS_GUTTER + 'px;',
      '}',
      '@media (min-width: 960px) and (orientation: landscape) {',
      '  html.goated-android-tv section[class~="h-[90vh]"] {',
      '    height: min(68dvh, 900px) !important;',
      '    min-height: min(420px, 68dvh) !important;',
      '    max-height: 900px !important;',
      '  }',
      '}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }

  function safeFocus(element, options) {
    if (!element || !isVisible(element)) return false;
    if (
      !element.hasAttribute('tabindex') &&
      !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(element.tagName)
    ) {
      element.setAttribute('tabindex', '0');
    }
    try {
      element.focus(options || { preventScroll: true });
    } catch (error) {
      try {
        element.focus();
      } catch (ignored) {}
    }
    return document.activeElement === element || element.contains(document.activeElement);
  }

  function isSlider(element) {
    return (
      !!element &&
      ((element.tagName === 'INPUT' && element.type === 'range') ||
        element.getAttribute('role') === 'slider')
    );
  }

  function isChoice(element) {
    return !!element && element.tagName === 'SELECT';
  }

  function focusSurfaceFor(element) {
    if (!isAndroidTv || !element || isSlider(element)) return null;
    var elementRect = rectOf(element);
    var children = Array.prototype.slice.call(element.children || []);
    return (
      children.filter(function (child) {
        if (!isVisible(child)) return false;
        var childRect = rectOf(child);
        var nearlyFullSize =
          childRect.width >= elementRect.width * 0.82 &&
          childRect.height >= elementRect.height * 0.72;
        if (!nearlyFullSize) return false;
        var style = window.getComputedStyle(child);
        return (
          style.overflow === 'hidden' ||
          style.overflow === 'clip' ||
          !!child.querySelector('img, video')
        );
      })[0] || null
    );
  }

  function clearFocusDecoration() {
    if (state.current) state.current.classList.remove(FOCUS_CLASS);
    if (state.focusSurface) state.focusSurface.classList.remove(FOCUS_SURFACE_CLASS);
    state.focusSurface = null;
  }

  function scrollToElement(element) {
    var rail = railFor(element);
    if (rail) {
      decorateVideoRail(element);
      var item = rectOf(element);
      var container = rectOf(rail);
      var horizontalDelta = scrollDeltaForVisibility(
        item.left,
        item.right,
        container.left + FOCUS_GUTTER,
        container.right - FOCUS_GUTTER
      );
      if (horizontalDelta) rail.scrollLeft += horizontalDelta;
    }

    if (isHomeHeroPrimary(element)) {
      scrollRootTo(0);
      return;
    }

    var itemRect = rectOf(element);
    var owner = verticalScrollOwner(element);
    if (owner) {
      var ownerRect = rectOf(owner);
      var ownerDelta = scrollDeltaForVisibility(
        itemRect.top,
        itemRect.bottom,
        ownerRect.top + FOCUS_GUTTER,
        ownerRect.bottom - FOCUS_GUTTER
      );
      if (ownerDelta) owner.scrollTop += ownerDelta;
      return;
    }

    var root = rootScrollElement();
    var topInset = Math.max(FOCUS_GUTTER, fixedHeaderBottom() + FOCUS_OUTSET);
    var rootDelta = scrollDeltaForVisibility(
      itemRect.top,
      itemRect.bottom,
      topInset,
      window.innerHeight - FOCUS_GUTTER
    );
    if (rootDelta || (root && root.scrollLeft)) {
      scrollRootTo((root ? root.scrollTop : window.scrollY || 0) + rootDelta);
    }
  }

  function setFocus(element, preservePreferredX) {
    if (!element || !isVisible(element)) return false;
    var previousPreferredX = state.preferredX;
    if (!safeFocus(element, { preventScroll: true })) return false;
    if (state.current !== element) clearFocusDecoration();
    state.current = element;
    element.classList.add(FOCUS_CLASS);
    state.focusSurface = focusSurfaceFor(element);
    if (state.focusSurface) state.focusSurface.classList.add(FOCUS_SURFACE_CLASS);
    scrollToElement(element);
    state.preferredX = preservePreferredX ? previousPreferredX : centerOf(element).x;
    return true;
  }

  function focusedElement() {
    var active = document.activeElement;
    if (
      state.current &&
      isVisible(state.current) &&
      state.current.classList.contains(FOCUS_CLASS) &&
      active &&
      active !== document.body &&
      (active === state.current ||
        (state.current.contains && state.current.contains(active)))
    )
      return state.current;
    if (active && active !== document.body && isVisible(active)) {
      if (state.current !== active) clearFocusDecoration();
      state.current = active;
      state.current.classList.add(FOCUS_CLASS);
      state.focusSurface = focusSurfaceFor(active);
      if (state.focusSurface) state.focusSurface.classList.add(FOCUS_SURFACE_CLASS);
      return state.current;
    }
    return null;
  }

  function preferredInitial(scope) {
    var items = candidates(scope);
    if (!items.length) return null;
    var play = items.filter(function (element) {
      var label = (element.getAttribute('aria-label') || element.textContent || '').trim();
      return /^(Play|Resume\b|Watch\b|Maybe later$)/i.test(label);
    })[0];
    return play || items[0];
  }

  function rememberFocusForScope(scope, element) {
    if (!scope || !element) return;
    if (state.focusMemory) state.focusMemory.set(scope, element);
    else if (scope === document.body) state.previousFocus = element;
  }

  function rememberedFocusForScope(scope) {
    if (!scope) return null;
    var remembered = state.focusMemory
      ? state.focusMemory.get(scope)
      : scope === document.body
        ? state.previousFocus
        : null;
    if (!remembered || !isVisible(remembered) || !scope.contains(remembered)) return null;
    return remembered;
  }

  function ensureFocus(force) {
    var scope = activeScope();
    if (scope !== state.previousScope) {
      if (
        state.previousScope &&
        state.current &&
        state.previousScope.contains(state.current)
      ) {
        rememberFocusForScope(state.previousScope, state.current);
      }
      state.previousScope = scope;
      force = true;
    }

    var current = focusedElement();
    if (!force && current && scope.contains(current)) return;

    var remembered = rememberedFocusForScope(scope);
    if (remembered && setFocus(remembered)) return;
    setFocus(preferredInitial(scope));
  }

  function resetFocusForRoute() {
    if (state.path === window.location.pathname) return false;
    state.path = window.location.pathname;
    clearFocusDecoration();
    state.current = null;
    state.previousFocus = null;
    state.focusMemory = typeof WeakMap === 'function' ? new WeakMap() : null;
    state.previousScope = null;
    state.preferredX = null;
    state.domVersion += 1;
    return true;
  }

  function focusNewRoute() {
    if (!resetFocusForRoute()) return;
    if (isAndroidTv) window.scrollTo(0, 0);
    setTimeout(function () {
      ensureFocus(true);
    }, 280);
  }

  function railFor(element) {
    return element && element.closest
      ? element.closest('.row-scroll, [class*="overflow-x-auto"], .goated-tizen4-rail')
      : null;
  }

  function railMove(current, direction) {
    var rail = railFor(current);
    if (!rail) return false;
    var items = candidates(rail).filter(function (element) {
      return railFor(element) === rail;
    });
    items.sort(function (a, b) {
      return centerOf(a).x - centerOf(b).x;
    });
    var index = items.indexOf(current);
    if (index < 0) return false;
    var nextIndex = direction === 'left' ? index - 1 : index + 1;
    if (!items[nextIndex]) return false;
    return setFocus(items[nextIndex]);
  }

  function verticalRailMove(current, direction, scope) {
    var currentRail = railFor(current);
    if (!currentRail) return false;
    var currentPoint = centerOf(currentRail);
    var rails = Array.prototype.slice
      .call(scope.querySelectorAll('.row-scroll, [class*="overflow-x-auto"], .goated-tizen4-rail'))
      .filter(function (rail, index, all) {
        if (rail === currentRail || all.indexOf(rail) !== index) return false;
        var rect = rectOf(rail);
        if (rect.width < 2 || rect.height < 2) return false;
        var delta = centerOf(rail).y - currentPoint.y;
        return direction === 'down' ? delta > 8 : delta < -8;
      });
    rails.sort(function (a, b) {
      return Math.abs(centerOf(a).y - currentPoint.y) - Math.abs(centerOf(b).y - currentPoint.y);
    });

    var targetX = state.preferredX !== null ? state.preferredX : centerOf(current).x;
    for (var railIndex = 0; railIndex < rails.length; railIndex++) {
      var targetItems = candidates(rails[railIndex]).filter(function (element) {
        return railFor(element) === rails[railIndex];
      });
      var best = null;
      var bestDistance = Infinity;
      targetItems.forEach(function (element) {
        var rect = rectOf(element);
        if (rect.width < 2 || rect.height < 2) return;
        var distance = Math.abs(rect.left + rect.width / 2 - targetX);
        if (distance < bestDistance) {
          best = element;
          bestDistance = distance;
        }
      });
      if (best) return setFocus(best, true);
    }
    return false;
  }

  function spatialMove(direction) {
    var scope = activeScope();
    var items = candidates(scope);
    if (!items.length) return false;
    var current = focusedElement();
    if (!current || !scope.contains(current)) {
      return setFocus(preferredInitial(scope));
    }

    var searchTarget = searchNavigationTarget(direction, current, items);
    if (searchTarget) return setFocus(searchTarget);

    if (
      (direction === 'up' || direction === 'down') &&
      verticalRailMove(current, direction, scope)
    ) {
      return true;
    }

    if ((direction === 'left' || direction === 'right') && railFor(current)) {
      return railMove(current, direction);
    }

    var origin = centerOf(current);
    var targetX =
      (direction === 'up' || direction === 'down') && state.preferredX !== null
        ? state.preferredX
        : origin.x;
    var best = null;
    var bestScore = Infinity;
    var currentRail = railFor(current);

    items.forEach(function (element) {
      if (element === current) return;
      var point = centerOf(element);
      if (
        (direction === 'up' || direction === 'down') &&
        currentRail &&
        railFor(element) === currentRail
      )
        return;
      var secondaryWeight =
        scope !== document.body && (direction === 'up' || direction === 'down') ? 0.55 : 3.25;
      var score = directionalScore(origin, point, direction, targetX, secondaryWeight);
      if (score < bestScore) {
        best = element;
        bestScore = score;
      }
    });

    return best ? setFocus(best, direction === 'up' || direction === 'down') : false;
  }

  function searchNavigationTarget(direction, current, items) {
    if (direction === 'down' && isTextInput(current)) {
      return (
        items.filter(function (element) {
          var label = (element.getAttribute('aria-label') || element.textContent || '').trim();
          return label === 'Play';
        })[0] || null
      );
    }

    var currentLabel = (current.getAttribute('aria-label') || current.textContent || '').trim();
    if (direction === 'up' && currentLabel === 'Play') {
      return items.filter(isTextInput)[0] || null;
    }
    return null;
  }

  function playerNavigationTarget(key, current, items) {
    var currentLabel = current ? controlLabel(current) : '';
    var startsAtBack =
      !current || current === document.body || /^(Back|Go back)$/i.test(currentLabel);
    if (key !== 'ArrowDown' || !startsAtBack) return null;

    return (
      items.filter(function (element) {
        return /^(Play|Pause)$/i.test(controlLabel(element));
      })[0] || null
    );
  }

  // A pure scoring function keeps the navigation geometry deterministic and testable.
  function directionalScore(origin, point, direction, targetX, secondaryWeight) {
    var dx = point.x - origin.x;
    var dy = point.y - origin.y;
    var primary;
    var secondary;
    if (direction === 'left') {
      primary = -dx;
      secondary = Math.abs(dy);
    } else if (direction === 'right') {
      primary = dx;
      secondary = Math.abs(dy);
    } else if (direction === 'up') {
      primary = -dy;
      secondary = Math.abs(point.x - targetX);
    } else {
      primary = dy;
      secondary = Math.abs(point.x - targetX);
    }
    if (primary <= 4) return Infinity;
    return primary + secondary * (secondaryWeight === undefined ? 3.25 : secondaryWeight);
  }

  function videoElement() {
    return document.querySelector('video');
  }

  function isPlayerPage() {
    return /^\/watch\//.test(window.location.pathname) && !!videoElement();
  }

  function wakePlayer() {
    var video = videoElement();
    if (!video) return;
    var rect = rectOf(video);
    try {
      video.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.bottom - 30
        })
      );
    } catch (ignored) {}
  }

  function seek(seconds) {
    var video = videoElement();
    if (!video || !isFinite(video.duration)) return false;
    video.currentTime = clampedSeekTime(video.currentTime, video.duration, seconds);
    wakePlayer();
    return true;
  }

  function clampedSeekTime(currentTime, duration, seconds) {
    return Math.max(0, Math.min(duration, currentTime + seconds));
  }

  function togglePlayback(force) {
    var video = videoElement();
    if (!video) return false;
    if (force === 'play' || (force !== 'pause' && video.paused)) {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function (error) {
          reportError('video-playback', error);
        });
      }
    } else video.pause();
    wakePlayer();
    return true;
  }

  function handleMedia(key) {
    if (key === 'MediaPlay' || key === 'Play') return togglePlayback('play');
    if (key === 'MediaPause' || key === 'Pause') return togglePlayback('pause');
    if (key === 'MediaPlayPause' || key === 'PlayPause') return togglePlayback();
    if (
      key === 'MediaFastForward' ||
      key === 'FastForward' ||
      key === 'MediaSkipForward' ||
      key === 'MediaStepForward'
    )
      return seek(15);
    if (
      key === 'MediaRewind' ||
      key === 'Rewind' ||
      key === 'MediaSkipBackward' ||
      key === 'MediaStepBackward'
    )
      return seek(-15);
    if (key === 'MediaTrackNext') return seek(15);
    if (key === 'MediaTrackPrevious') return seek(-15);
    if (key === 'MediaStop' || key === 'Stop' || key === 'MediaClose') {
      var video = videoElement();
      if (!video) return false;
      video.pause();
      video.currentTime = 0;
      return true;
    }
    return false;
  }

  function sliderValueAfterStep(current, minimum, maximum, step, direction) {
    var value = Number(current);
    var min = Number(minimum);
    var max = Number(maximum);
    var amount = Number(step);
    if (!isFinite(value)) value = 0;
    if (!isFinite(min)) min = 0;
    if (!isFinite(max)) max = 100;
    if (!isFinite(amount) || amount <= 0) amount = Math.max((max - min) / 100, 1);
    var precision = Math.max(
      String(amount).split('.')[1] ? String(amount).split('.')[1].length : 0,
      String(value).split('.')[1] ? String(value).split('.')[1].length : 0
    );
    var next = value + (direction === 'left' ? -amount : amount);
    return Number(Math.max(min, Math.min(max, next)).toFixed(precision));
  }

  function adjustSlider(element, direction) {
    if (!isSlider(element)) return false;
    if (element.tagName !== 'INPUT' || element.type !== 'range') {
      var forwarded = new window.KeyboardEvent('keydown', {
        key: direction === 'left' ? 'ArrowLeft' : 'ArrowRight',
        bubbles: true,
        cancelable: true
      });
      try {
        Object.defineProperty(forwarded, '__goatedTvSliderForwarded', { value: true });
      } catch (ignored) {}
      element.dispatchEvent(forwarded);
      return true;
    }

    var next = sliderValueAfterStep(
      element.value,
      element.min === '' ? 0 : element.min,
      element.max === '' ? 100 : element.max,
      element.step === '' || element.step === 'any' ? 1 : element.step,
      direction
    );
    if (String(next) === String(element.value)) return true;
    var valueDescriptor = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    );
    var valueSetter = valueDescriptor && valueDescriptor.set;
    if (valueSetter) valueSetter.call(element, String(next));
    else element.value = String(next);
    element.dispatchEvent(new window.Event('input', { bubbles: true }));
    element.dispatchEvent(new window.Event('change', { bubbles: true }));
    return true;
  }

  function choiceIndexAfterStep(currentIndex, disabledOptions, direction, optionCount) {
    var index = Number(currentIndex);
    var step = direction === 'left' ? -1 : 1;
    var candidate = index + step;
    while (candidate >= 0 && candidate < optionCount) {
      if (disabledOptions.indexOf(candidate) === -1) return candidate;
      candidate += step;
    }
    return index;
  }

  function adjustChoice(element, direction) {
    if (!isChoice(element)) return false;
    var disabled = Array.prototype.slice
      .call(element.options || [])
      .map(function (option, index) {
        return option.disabled ? index : -1;
      })
      .filter(function (index) {
        return index >= 0;
      });
    var nextIndex = choiceIndexAfterStep(
      element.selectedIndex,
      disabled,
      direction,
      element.options.length
    );
    if (nextIndex === element.selectedIndex) return true;
    element.selectedIndex = nextIndex;
    element.dispatchEvent(new window.Event('input', { bubbles: true }));
    element.dispatchEvent(new window.Event('change', { bubbles: true }));
    return true;
  }

  function normalizedKey(event) {
    var codeMap = {
      13: 'Enter',
      18: 'ContextMenu',
      32: ' ',
      37: 'ArrowLeft',
      38: 'ArrowUp',
      39: 'ArrowRight',
      40: 'ArrowDown',
      10009: 'Back',
      412: 'MediaRewind',
      413: 'MediaStop',
      415: 'MediaPlay',
      417: 'MediaFastForward',
      457: 'Info',
      19: 'MediaPause',
      10232: 'MediaTrackPrevious',
      10233: 'MediaTrackNext',
      10221: 'Captions',
      10252: 'MediaPlayPause'
    };
    return codeMap[event.keyCode] || codeMap[event.which] || event.key || event.code || '';
  }

  function isTextInput(element) {
    return (
      !!element && (/^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName) || element.isContentEditable)
    );
  }

  function controlLabel(element) {
    return (
      element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.innerText ||
      element.textContent ||
      ''
    ).trim();
  }

  function activateNamedControl(pattern) {
    var scope = activeScope();
    var items = Array.prototype.slice.call(scope.querySelectorAll(SELECTOR));
    if (scope.matches && scope.matches(SELECTOR)) items.unshift(scope);
    var item = items.filter(isVisible).filter(function (element) {
      return pattern.test(controlLabel(element));
    })[0];
    if (!item) return false;
    setFocus(item);
    if (item.matches('button, a, [role="button"], [role="link"]')) item.click();
    return true;
  }

  function activateGlobalControlWhenAvailable(pattern, attempts) {
    var items = Array.prototype.slice.call(document.body.querySelectorAll(SELECTOR));
    var item = items.filter(isVisible).filter(function (element) {
      return pattern.test(controlLabel(element));
    })[0];
    if (item) {
      setFocus(item);
      if (item.matches('button, a, [role="button"], [role="link"]')) item.click();
      return;
    }
    if (attempts <= 0) return;
    setTimeout(function () {
      activateGlobalControlWhenAvailable(pattern, attempts - 1);
    }, 180);
  }

  function handleShortcut(key) {
    if (key === 'ContextMenu' || key === 'Menu') {
      return activateNamedControl(/^(Settings|Menu)$/i);
    }
    if (key === 'Info') {
      return activateNamedControl(/^(Info|More info(?:rmation)?|Details|View details)$/i);
    }
    if (key === 'Captions') {
      if (activateNamedControl(/^(Captions|Closed captions|Subtitles)(?:\b|$)/i)) return true;
      if (isPlayerPage() && activateNamedControl(/^Settings$/i)) {
        setTimeout(function () {
          activateGlobalControlWhenAvailable(/^(Captions|Closed captions|Subtitles)(?:\b|$)/i, 8);
        }, 1000);
        return true;
      }
    }
    return false;
  }

  function clickWithDiagnostics(element, event) {
    var clickAt = monotonicNow();
    diagnostics.lastActivation = {
      key: normalizedKey(event || {}),
      label: controlLabel(element),
      pathBefore: window.location.pathname,
      bridgeAt:
        event && typeof event.__goatedTvBridgeAt === 'number' ? event.__goatedTvBridgeAt : null,
      handlerAt:
        diagnostics.lastKeyDown && diagnostics.lastKeyDown.key === normalizedKey(event || {})
          ? diagnostics.lastKeyDown.at
          : null,
      clickAt: clickAt,
      clickReturnedAt: null,
      routeAt: null,
      routeDelayMs: null,
      pathAfter: null
    };
    element.click();
    diagnostics.lastActivation.clickReturnedAt = monotonicNow();
    return true;
  }

  function activateFocused(event) {
    var current = focusedElement();
    if (!current) return false;
    if (isTextInput(current)) {
      if (
        current.tagName === 'INPUT' &&
        /^(button|checkbox|color|radio|reset|submit)$/.test(current.type)
      ) {
        return clickWithDiagnostics(current, event);
      }
      return false;
    }
    if (
      current.matches(
        'a, button, [role="button"], [role="link"], [role="switch"], [role="tab"], [role="menuitem"], [role="option"], [role="checkbox"], [role="radio"], [role="combobox"]'
      ) ||
      typeof current.onclick === 'function'
    ) {
      clickWithDiagnostics(current, event);
      setTimeout(function () {
        ensureFocus(false);
      }, 80);
      return true;
    }
    return false;
  }

  function closeCurrentLayer() {
    var scope = activeScope();
    if (scope !== document.body) {
      var close = Array.prototype.slice
        .call(scope.querySelectorAll('button, [role="button"]'))
        .filter(function (button) {
          var label = (button.getAttribute('aria-label') || button.textContent || '').trim();
          return /^(Close|Cancel|Maybe later)$/i.test(label);
        })[0];
      if (!close) {
        var buttons = Array.prototype.slice
          .call(scope.querySelectorAll('button'))
          .filter(isVisible);
        close = buttons.filter(function (button) {
          var rect = rectOf(button);
          return rect.top < window.innerHeight * 0.3 && rect.right > window.innerWidth * 0.6;
        })[0];
      }
      if (close) {
        close.click();
        setTimeout(function () {
          ensureFocus(false);
        }, 240);
        return true;
      }
    }

    var current = focusedElement();
    if (isTextInput(current)) {
      current.blur();
      ensureFocus(true);
      return true;
    }

    if (isPlayerPage()) {
      var backButton = document.querySelector('button[aria-label="Back"]');
      if (backButton && isVisible(backButton)) {
        backButton.click();
        setTimeout(function () {
          ensureFocus(false);
        }, 240);
        return true;
      }
    }
    if (window.history.length > 1) {
      window.history.back();
      return true;
    }
    try {
      if (window.tizen && tizen.application) {
        tizen.application.getCurrentApplication().exit();
        return true;
      }
    } catch (ignored) {}
    return false;
  }

  function playerArrow(key) {
    wakePlayer();
    var current = focusedElement();
    var onPlayerControl = current && current.closest && current.closest('button');

    if ((key === 'ArrowLeft' || key === 'ArrowRight') && !onPlayerControl) {
      return seek(key === 'ArrowLeft' ? -15 : 15);
    }
    var target = playerNavigationTarget(key, current, candidates(document.body));
    if (target) return setFocus(target);
    return spatialMove(key.slice(5).toLowerCase());
  }

  function handleKeyDown(event) {
    if (event.__goatedTvSliderForwarded) return;
    var key = normalizedKey(event);
    if (!key) return;
    diagnostics.lastKeyDown = {
      key: key,
      at: monotonicNow(),
      bridgeAt: typeof event.__goatedTvBridgeAt === 'number' ? event.__goatedTvBridgeAt : null
    };
    state.userInteracted = true;

    if (handleMedia(key)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (handleShortcut(key)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (
      key === 'Back' ||
      key === 'BrowserBack' ||
      key === 'XF86Back' ||
      key === 'Escape' ||
      event.keyCode === 10009
    ) {
      if (closeCurrentLayer()) {
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }

    if (/^Arrow(Up|Down|Left|Right)$/.test(key)) {
      var active = focusedElement();
      if (
        isSlider(active) &&
        (isAndroidTv || active.tagName !== 'INPUT') &&
        (key === 'ArrowLeft' || key === 'ArrowRight')
      ) {
        adjustSlider(active, key === 'ArrowLeft' ? 'left' : 'right');
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (isAndroidTv && isChoice(active) && (key === 'ArrowLeft' || key === 'ArrowRight')) {
        adjustChoice(active, key === 'ArrowLeft' ? 'left' : 'right');
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (isTextInput(active) && (key === 'ArrowLeft' || key === 'ArrowRight')) return;
      if (isPlayerPage()) playerArrow(key);
      else spatialMove(key.slice(5).toLowerCase());
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if ((key === ' ' || key === 'Spacebar') && isTextInput(focusedElement())) return;

    if (key === 'Enter' || key === 'NumpadEnter' || key === ' ' || key === 'Spacebar') {
      var activated = activateFocused(event);
      if (!activated && isPlayerPage()) activated = togglePlayback();
      if (activated) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  function handleFocusIn(event) {
    var target = event.target;
    if (!target || target === document.body || !isVisible(target)) return;
    if (state.current !== target) clearFocusDecoration();
    state.current = target;
    target.classList.add(FOCUS_CLASS);
    state.focusSurface = focusSurfaceFor(target);
    if (state.focusSurface) state.focusSurface.classList.add(FOCUS_SURFACE_CLASS);
    state.preferredX = centerOf(target).x;
  }

  function normalizedCandidateClass(value) {
    var owned = [FOCUS_CLASS, FOCUS_SURFACE_CLASS, VIDEO_CARD_CLASS, VIDEO_RAIL_CLASS];
    return String(value || '')
      .split(/\s+/)
      .filter(function (name) {
        return name && owned.indexOf(name) === -1;
      })
      .sort()
      .join(' ');
  }

  function candidateMutationAffectsCache(record) {
    if (!record) return false;
    if (record.type === 'attributes') {
      if (record.attributeName === 'class') {
        var currentClass =
          record.target && record.target.getAttribute ? record.target.getAttribute('class') : '';
        return normalizedCandidateClass(record.oldValue) !== normalizedCandidateClass(currentClass);
      }
      return true;
    }
    if (record.type !== 'childList') return false;
    var changedNodes = Array.prototype.slice
      .call(record.addedNodes || [])
      .concat(Array.prototype.slice.call(record.removedNodes || []));
    return changedNodes.some(function (node) {
      return (
        node.nodeType === 1 &&
        ((node.matches && node.matches(SELECTOR)) ||
          (node.querySelector && node.querySelector(SELECTOR)))
      );
    });
  }

  function scheduleRefresh(records) {
    var routeChanged = resetFocusForRoute();
    if (records && records.some(candidateMutationAffectsCache)) state.domVersion += 1;
    if (state.mutationTimer) return;
    state.mutationTimer = setTimeout(function () {
      state.mutationTimer = null;
      ensureFocus(routeChanged || !state.userInteracted);
    }, 180);
  }

  function tuneImages(root) {
    if (!root || root.nodeType !== 1) return;
    var images =
      root.tagName === 'IMG' ? [root] : Array.prototype.slice.call(root.querySelectorAll('img'));
    images.forEach(function (image) {
      image.decoding = 'async';
      if (image.getAttribute('fetchpriority') === 'high') return;
      var rect = rectOf(image);
      if (rect.top > window.innerHeight * 1.25 || rect.bottom < -window.innerHeight * 0.25) {
        image.loading = 'lazy';
      }
    });
  }

  function start() {
    if (state.started) return;
    state.started = true;
    document.documentElement.classList.add('goated-tv-mode');
    if (tizen4RescueActive) installTizen4RescueMode();
    if (isAndroidTv) document.documentElement.classList.add('goated-android-tv');
    if (isAndroidTv) window.scrollTo(0, 0);
    addStyle();
    registerTizenRemoteKeys();
    tuneImages(document.documentElement);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocusIn, true);
    ['pushState', 'replaceState'].forEach(function (method) {
      var original = window.history[method];
      if (typeof original !== 'function') return;
      window.history[method] = function () {
        var result = original.apply(window.history, arguments);
        markActivationRoute();
        focusNewRoute();
        return result;
      };
    });
    window.addEventListener('popstate', function () {
      markActivationRoute();
      focusNewRoute();
    });
    new MutationObserver(function (records) {
      records.forEach(function (record) {
        Array.prototype.forEach.call(record.addedNodes || [], function (node) {
          tuneImages(node);
          if (tizen4RescueActive) applyTizen4RescueClasses(node);
        });
      });
      scheduleRefresh(records);
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: [
        'class',
        'style',
        'hidden',
        'aria-hidden',
        'aria-modal',
        'aria-disabled',
        'disabled',
        'tabindex',
        'role',
        'href',
        'contenteditable',
        'inert',
        'data-state',
        'aria-expanded',
        'open'
      ]
    });
    setTimeout(function () {
      ensureFocus(true);
    }, 350);
    setTimeout(function () {
      if (!state.userInteracted) ensureFocus(true);
    }, 1600);
    setTimeout(function () {
      if (!state.userInteracted) ensureFocus(true);
    }, 4000);
    setInterval(function () {
      ensureFocus(false);
    }, 2000);
  }

  function supportedRemoteKeys(desiredKeys, supportedKeys) {
    var supportedNames = supportedKeys.map(function (key) {
      return key.name;
    });
    return desiredKeys.filter(function (key) {
      return supportedNames.indexOf(key) !== -1;
    });
  }

  function registerTizenRemoteKeys() {
    try {
      if (!window.tizen || !tizen.tvinputdevice) return;
      var desiredKeys = [
        'MediaPlayPause',
        'MediaPlay',
        'MediaPause',
        'MediaStop',
        'MediaFastForward',
        'MediaRewind',
        'MediaTrackPrevious',
        'MediaTrackNext',
        'Menu',
        'Info',
        'Caption'
      ];
      var supported = tizen.tvinputdevice.getSupportedKeys();
      var keys = supportedRemoteKeys(desiredKeys, supported);
      if (!keys.length) return;
      function registerIndividually() {
        keys.forEach(function (key) {
          try {
            tizen.tvinputdevice.registerKey(key);
          } catch (error) {
            reportError('remote-key-registration-' + key, error);
          }
        });
      }
      if (typeof tizen.tvinputdevice.registerKeyBatch === 'function') {
        tizen.tvinputdevice.registerKeyBatch(keys, function () {}, registerIndividually);
      } else {
        registerIndividually();
      }
    } catch (error) {
      reportError('remote-key-registration', error);
    }
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
