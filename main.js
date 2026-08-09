(function () {
  'use strict';

  if (window.top !== window.self) return;

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
      (a + 0x6a09e667) >>> 0, (b + 0xbb67ae85) >>> 0,
      (c + 0x3c6ef372) >>> 0, (d + 0xa54ff53a) >>> 0,
      (e + 0x510e527f) >>> 0, (f + 0x9b05688c) >>> 0,
      (g + 0x1f83d9ab) >>> 0, (h + 0x5be0cd19) >>> 0
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
      var source = 'var POW_K=' + JSON.stringify(POW_K) + ';' +
        powHashHasPrefix.toString() + ';(' + powWorkerMain.toString() + ')();';
      var objectUrl;
      var workers = [];
      var settled = false;
      var exhaustedWorkers = 0;
      var timer;
      function finish(error, nonce) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        workers.forEach(function (worker) { worker.terminate(); });
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
          worker.onerror = function () { finish(new Error('Background proof worker failed')); };
          worker.postMessage({
            challenge: challenge,
            difficulty: difficulty,
            start: workerIndex,
            step: workerCount,
            maximum: 5000000
          });
        }
        timer = setTimeout(function () { finish(new Error('Background proof timed out')); }, 14000);
      } catch (error) {
        finish(error);
      }
    });
  }

  function installSourceResolverAcceleration() {
    var userAgent = navigator.userAgent || '';
    if (!/Tizen|SMART-TV/i.test(userAgent) || location.hostname !== 'goated.cx') return;
    if (window.__goatedTvSourceBoost || typeof window.fetch !== 'function') return;
    window.__goatedTvSourceBoost = true;
    var nativeFetch = window.fetch.bind(window);
    var proofs = {};

    window.fetch = function (input, init) {
      var requestUrl = typeof input === 'string' ? input : (input && input.url) || '';
      if (/^https:\/\/api\.reallyfast\.xyz\/api\/challenge(?:\?|$)/.test(requestUrl)) {
        return nativeFetch(input, init).then(function (response) {
          return response.clone().json().then(function (data) {
            if (!data || !data.challenge || !data.difficulty) return response;
            proofs[data.challenge] = solveProofInWorkers(data.challenge, Number(data.difficulty));
            var accelerated = {};
            Object.keys(data).forEach(function (key) { accelerated[key] = data[key]; });
            accelerated.difficulty = 0;
            return new Response(JSON.stringify(accelerated), {
              status: response.status,
              statusText: response.statusText,
              headers: { 'Content-Type': 'application/json' }
            });
          }).catch(function () { return response; });
        });
      }

      if (/^https:\/\/api\.reallyfast\.xyz\/api\/(?:resolve|subtitles)(?:\?|$)/.test(requestUrl) && init && init.body) {
        try {
          var body = JSON.parse(init.body);
          var proof = body.challenge && proofs[body.challenge];
          if (proof) {
            return proof.then(function (nonce) {
              var acceleratedInit = {};
              Object.keys(init).forEach(function (key) { acceleratedInit[key] = init[key]; });
              body.nonce = nonce;
              acceleratedInit.body = JSON.stringify(body);
              delete proofs[body.challenge];
              return nativeFetch(input, acceleratedInit);
            });
          }
        } catch (ignored) {}
      }
      return nativeFetch(input, init);
    };
  }

  installSourceResolverAcceleration();

  var STYLE_ID = 'goated-tv-navigation-style';
  var FOCUS_CLASS = 'goated-tv-focused';
  var SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[role="button"]',
    '[role="link"]',
    '[role="slider"]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  var state = {
    current: null,
    preferredX: null,
    previousScope: null,
    previousFocus: null,
    mutationTimer: null,
    domVersion: 0,
    candidateCache: typeof WeakMap === 'function' ? new WeakMap() : null,
    userInteracted: false,
    started: false
  };

  function rectOf(element) {
    return element.getBoundingClientRect();
  }

  function centerOf(element) {
    var rect = rectOf(element);
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function isVisible(element) {
    if (!element || !element.isConnected || element.disabled) return false;
    if (element.getAttribute('aria-hidden') === 'true') return false;
    var rect = rectOf(element);
    if (rect.width < 2 || rect.height < 2) return false;
    var style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function numericZIndex(element) {
    var value = parseInt(window.getComputedStyle(element).zIndex, 10);
    return isNaN(value) ? 0 : value;
  }

  function activeScope() {
    var dialogs = Array.prototype.slice.call(
      document.querySelectorAll('[role="dialog"][aria-modal="true"]')
    ).filter(isVisible);
    if (dialogs.length) {
      dialogs.sort(function (a, b) { return numericZIndex(a) - numericZIndex(b); });
      return dialogs[dialogs.length - 1];
    }

    var overlaySelector = '[class*="fixed"], [style*="position: fixed"], [style*="position:fixed"]';
    var fixedOverlays = Array.prototype.slice.call(document.body.querySelectorAll(overlaySelector)).filter(function (element) {
      if (!isVisible(element)) return false;
      var style = window.getComputedStyle(element);
      if (style.position !== 'fixed' || numericZIndex(element) < 60) return false;
      var rect = rectOf(element);
      if (rect.width < window.innerWidth * 0.7 || rect.height < window.innerHeight * 0.7) return false;
      return !!element.querySelector(SELECTOR);
    });
    fixedOverlays.sort(function (a, b) { return numericZIndex(a) - numericZIndex(b); });
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
        var sameBox = Math.abs(parentRect.left - elementRect.left) < 2 &&
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
    var items = found.filter(function (element, index, all) {
      return isVisible(element) &&
        !isUtilityControl(element) &&
        !hasInteractiveAncestor(element, scope) &&
        all.indexOf(element) === index;
    });
    if (state.candidateCache) state.candidateCache.set(scope, { version: state.domVersion, items: items });
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
      'input.' + FOCUS_CLASS + ', textarea.' + FOCUS_CLASS + ', select.' + FOCUS_CLASS + ' {',
      '  transform: none !important;',
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
      '}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }

  function safeFocus(element, options) {
    if (!element || !isVisible(element)) return false;
    if (!element.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(element.tagName)) {
      element.setAttribute('tabindex', '0');
    }
    try { element.focus(options || { preventScroll: true }); }
    catch (error) { try { element.focus(); } catch (ignored) {} }
    return document.activeElement === element || element.contains(document.activeElement);
  }

  function scrollToElement(element) {
    var rail = railFor(element);
    if (rail) {
      var item = rectOf(element);
      var container = rectOf(rail);
      if (item.left < container.left + 24) rail.scrollLeft -= container.left + 80 - item.left;
      else if (item.right > container.right - 24) rail.scrollLeft += item.right - container.right + 80;
    }
    try { element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' }); }
    catch (error) { element.scrollIntoView(false); }
  }

  function setFocus(element, preservePreferredX) {
    if (!element || !isVisible(element)) return false;
    var previousPreferredX = state.preferredX;
    if (state.current && state.current !== element) state.current.classList.remove(FOCUS_CLASS);
    state.current = element;
    element.classList.add(FOCUS_CLASS);
    safeFocus(element, { preventScroll: true });
    scrollToElement(element);
    state.preferredX = preservePreferredX ? previousPreferredX : centerOf(element).x;
    return true;
  }

  function focusedElement() {
    if (state.current && isVisible(state.current) && state.current.classList.contains(FOCUS_CLASS)) return state.current;
    if (document.activeElement && document.activeElement !== document.body && isVisible(document.activeElement)) {
      state.current = document.activeElement;
      state.current.classList.add(FOCUS_CLASS);
      return state.current;
    }
    return null;
  }

  function preferredInitial(scope) {
    var items = candidates(scope);
    if (!items.length) return null;
    var play = items.filter(function (element) {
      var label = (element.getAttribute('aria-label') || element.textContent || '').trim();
      return label === 'Play' || label === 'Maybe later';
    })[0];
    return play || items[0];
  }

  function ensureFocus(force) {
    var scope = activeScope();
    if (scope !== state.previousScope) {
      if (scope !== document.body && state.previousScope && state.current && state.previousScope.contains(state.current)) {
        state.previousFocus = state.current;
      }
      state.previousScope = scope;
      force = true;
    }

    var current = focusedElement();
    if (!force && current && scope.contains(current)) return;

    if (scope === document.body && state.previousFocus && isVisible(state.previousFocus)) {
      setFocus(state.previousFocus);
      state.previousFocus = null;
      return;
    }
    setFocus(preferredInitial(scope));
  }

  function railFor(element) {
    return element && element.closest ? element.closest('.row-scroll, [class*="overflow-x-auto"]') : null;
  }

  function railMove(current, direction, scope) {
    var rail = railFor(current);
    if (!rail) return false;
    var items = candidates(rail).filter(function (element) { return railFor(element) === rail; });
    items.sort(function (a, b) { return centerOf(a).x - centerOf(b).x; });
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
    var rails = Array.prototype.slice.call(
      scope.querySelectorAll('.row-scroll, [class*="overflow-x-auto"]')
    ).filter(function (rail, index, all) {
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
        if (distance < bestDistance) { best = element; bestDistance = distance; }
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

    if (direction === 'down' && isTextInput(current)) {
      var primaryAction = items.filter(function (element) {
        var label = (element.getAttribute('aria-label') || element.textContent || '').trim();
        return label === 'Play';
      })[0];
      if (primaryAction) return setFocus(primaryAction);
    }

    if (direction === 'up') {
      var currentLabel = (current.getAttribute('aria-label') || current.textContent || '').trim();
      if (currentLabel === 'Play') {
        var searchInput = items.filter(isTextInput)[0];
        if (searchInput) return setFocus(searchInput);
      }
    }

    if ((direction === 'up' || direction === 'down') && verticalRailMove(current, direction, scope)) {
      return true;
    }

    if ((direction === 'left' || direction === 'right') && railFor(current)) {
      return railMove(current, direction, scope);
    }

    var origin = centerOf(current);
    var targetX = (direction === 'up' || direction === 'down') && state.preferredX !== null ? state.preferredX : origin.x;
    var best = null;
    var bestScore = Infinity;
    var currentRail = railFor(current);

    items.forEach(function (element) {
      if (element === current) return;
      var point = centerOf(element);
      var dx = point.x - origin.x;
      var dy = point.y - origin.y;
      var primary;
      var secondary;
      if (direction === 'left') { primary = -dx; secondary = Math.abs(dy); }
      else if (direction === 'right') { primary = dx; secondary = Math.abs(dy); }
      else if (direction === 'up') { primary = -dy; secondary = Math.abs(point.x - targetX); }
      else { primary = dy; secondary = Math.abs(point.x - targetX); }
      if (primary <= 4) return;
      if ((direction === 'up' || direction === 'down') && currentRail && railFor(element) === currentRail) return;

      var axisPenalty = secondary * 3.25;
      var distancePenalty = primary;
      var score = distancePenalty + axisPenalty;
      if (score < bestScore) { best = element; bestScore = score; }
    });

    return best ? setFocus(best, direction === 'up' || direction === 'down') : false;
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
      video.dispatchEvent(new MouseEvent('mousemove', {
        bubbles: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.bottom - 30
      }));
    } catch (ignored) {}
  }

  function seek(seconds) {
    var video = videoElement();
    if (!video || !isFinite(video.duration)) return false;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    wakePlayer();
    return true;
  }

  function togglePlayback(force) {
    var video = videoElement();
    if (!video) return false;
    if (force === 'play' || (force !== 'pause' && video.paused)) {
      var promise = video.play();
      if (promise && promise.catch) promise.catch(function () {});
    } else video.pause();
    wakePlayer();
    return true;
  }

  function handleMedia(key) {
    if (key === 'MediaPlay' || key === 'Play') return togglePlayback('play');
    if (key === 'MediaPause' || key === 'Pause') return togglePlayback('pause');
    if (key === 'MediaPlayPause' || key === 'PlayPause') return togglePlayback();
    if (key === 'MediaFastForward' || key === 'FastForward') return seek(15);
    if (key === 'MediaRewind' || key === 'Rewind') return seek(-15);
    if (key === 'MediaTrackNext') return seek(15);
    if (key === 'MediaTrackPrevious') return seek(-15);
    if (key === 'MediaStop' || key === 'Stop') {
      var video = videoElement();
      if (!video) return false;
      video.pause();
      video.currentTime = 0;
      return true;
    }
    return false;
  }

  function normalizedKey(event) {
    var codeMap = {
      13: 'Enter', 37: 'ArrowLeft', 38: 'ArrowUp', 39: 'ArrowRight', 40: 'ArrowDown',
      10009: 'Back', 412: 'MediaRewind', 413: 'MediaStop', 415: 'MediaPlay',
      417: 'MediaFastForward', 19: 'MediaPause', 10232: 'MediaTrackPrevious',
      10233: 'MediaTrackNext', 10252: 'MediaPlayPause'
    };
    return codeMap[event.keyCode] || codeMap[event.which] || event.key || event.code || '';
  }

  function isTextInput(element) {
    return !!element && /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName);
  }

  function activateFocused() {
    var current = focusedElement();
    if (!current) return false;
    if (isTextInput(current)) return false;
    if (current.matches('a, button, [role="button"], [role="link"]') || typeof current.onclick === 'function') {
      current.click();
      setTimeout(function () { ensureFocus(false); }, 240);
      return true;
    }
    return false;
  }

  function closeCurrentLayer() {
    var scope = activeScope();
    if (scope !== document.body) {
      var close = Array.prototype.slice.call(scope.querySelectorAll('button, [role="button"]')).filter(function (button) {
        var label = (button.getAttribute('aria-label') || button.textContent || '').trim();
        return /^(Close|Cancel|Maybe later)$/i.test(label);
      })[0];
      if (!close) {
        var buttons = Array.prototype.slice.call(scope.querySelectorAll('button')).filter(isVisible);
        close = buttons.filter(function (button) {
          var rect = rectOf(button);
          return rect.top < window.innerHeight * 0.3 && rect.right > window.innerWidth * 0.6;
        })[0];
      }
      if (close) {
        close.click();
        setTimeout(function () { ensureFocus(false); }, 240);
        return true;
      }
    }

    var current = focusedElement();
    if (isTextInput(current)) { current.blur(); ensureFocus(true); return true; }

    if (isPlayerPage()) {
      var backButton = document.querySelector('button[aria-label="Back"]');
      if (backButton && isVisible(backButton)) {
        backButton.click();
        setTimeout(function () { ensureFocus(false); }, 240);
        return true;
      }
    }
    if (window.history.length > 1) { window.history.back(); return true; }
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
    var label = current ? (current.getAttribute('aria-label') || '') : '';
    var onPlayerControl = current && current.closest && current.closest('button');

    if ((key === 'ArrowLeft' || key === 'ArrowRight') && !onPlayerControl) {
      return seek(key === 'ArrowLeft' ? -15 : 15);
    }
    if (key === 'ArrowDown' && (!current || current === document.body || label === 'Back')) {
      wakePlayer();
      var play = document.querySelector('button[aria-label="Play"], button[aria-label="Pause"]');
      return play ? setFocus(play) : false;
    }
    if (key === 'ArrowUp' && onPlayerControl && label !== 'Back') {
      var back = document.querySelector('button[aria-label="Back"]');
      return back ? setFocus(back) : false;
    }
    return spatialMove(key.slice(5).toLowerCase());
  }

  function handleKeyDown(event) {
    var key = normalizedKey(event);
    if (!key) return;
    state.userInteracted = true;

    if (handleMedia(key)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (key === 'Back' || key === 'BrowserBack' || key === 'XF86Back' || event.keyCode === 10009) {
      if (closeCurrentLayer()) {
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }

    if (/^Arrow(Up|Down|Left|Right)$/.test(key)) {
      var active = focusedElement();
      if (isTextInput(active) && (key === 'ArrowLeft' || key === 'ArrowRight')) return;
      if (isPlayerPage()) playerArrow(key);
      else spatialMove(key.slice(5).toLowerCase());
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (key === 'Enter' || key === 'NumpadEnter') {
      var activated = activateFocused();
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
    if (state.current && state.current !== target) state.current.classList.remove(FOCUS_CLASS);
    state.current = target;
    target.classList.add(FOCUS_CLASS);
    state.preferredX = centerOf(target).x;
  }

  function scheduleRefresh(records) {
    if (records && records.some(function (record) {
      if (record.type === 'attributes') {
        return record.attributeName !== 'class' && record.attributeName !== 'style';
      }
      var changedNodes = Array.prototype.slice.call(record.addedNodes || []).concat(
        Array.prototype.slice.call(record.removedNodes || [])
      );
      return changedNodes.some(function (node) {
        return node.nodeType === 1 && ((node.matches && node.matches(SELECTOR)) ||
          (node.querySelector && node.querySelector(SELECTOR)));
      });
    })) state.domVersion += 1;
    if (state.mutationTimer) return;
    state.mutationTimer = setTimeout(function () {
      state.mutationTimer = null;
      ensureFocus(false);
    }, 180);
  }

  function tuneImages(root) {
    if (!root || root.nodeType !== 1) return;
    var images = root.tagName === 'IMG' ? [root] : Array.prototype.slice.call(root.querySelectorAll('img'));
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
    addStyle();
    tuneImages(document.documentElement);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocusIn, true);
    window.addEventListener('popstate', function () { setTimeout(function () { ensureFocus(true); }, 250); });
    new MutationObserver(function (records) {
      records.forEach(function (record) {
        Array.prototype.forEach.call(record.addedNodes || [], tuneImages);
      });
      scheduleRefresh(records);
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'aria-hidden', 'aria-modal']
    });
    setTimeout(function () { ensureFocus(true); }, 350);
    setTimeout(function () {
      if (!state.userInteracted) ensureFocus(true);
    }, 1600);
    setInterval(function () { ensureFocus(false); }, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
