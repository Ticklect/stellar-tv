(function () {
  'use strict';

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
    var found = Array.prototype.slice.call(scope.querySelectorAll(SELECTOR));
    if (scope.matches && scope.matches(SELECTOR)) found.unshift(scope);
    return found.filter(function (element, index, all) {
      return isVisible(element) &&
        !isUtilityControl(element) &&
        !hasInteractiveAncestor(element, scope) &&
        all.indexOf(element) === index;
    });
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
      '.' + FOCUS_CLASS + ' img { filter: brightness(1.08); }'
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
    try { element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); }
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
      if (state.previousScope && state.current && state.previousScope.contains(state.current)) state.previousFocus = state.current;
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
    var items = candidates(scope).filter(function (element) { return railFor(element) === rail; });
    items.sort(function (a, b) { return centerOf(a).x - centerOf(b).x; });
    var index = items.indexOf(current);
    if (index < 0) return false;
    var nextIndex = direction === 'left' ? index - 1 : index + 1;
    if (!items[nextIndex]) return false;
    return setFocus(items[nextIndex]);
  }

  function spatialMove(direction) {
    var scope = activeScope();
    var items = candidates(scope);
    if (!items.length) return false;
    var current = focusedElement();
    if (!current || !scope.contains(current)) {
      return setFocus(preferredInitial(scope));
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
      417: 'MediaFastForward', 19: 'MediaPause', 10252: 'MediaPlayPause'
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
      if (close) { close.click(); return true; }
    }

    var current = focusedElement();
    if (isTextInput(current)) { current.blur(); ensureFocus(true); return true; }

    if (isPlayerPage()) {
      var backButton = document.querySelector('button[aria-label="Back"]');
      if (backButton && isVisible(backButton)) { backButton.click(); return true; }
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
      var moved = isPlayerPage() ? playerArrow(key) : spatialMove(key.slice(5).toLowerCase());
      if (moved) {
        event.preventDefault();
        event.stopPropagation();
      }
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

  function scheduleRefresh() {
    clearTimeout(state.mutationTimer);
    state.mutationTimer = setTimeout(function () { ensureFocus(false); }, 120);
  }

  function start() {
    if (state.started) return;
    state.started = true;
    addStyle();
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocusIn, true);
    window.addEventListener('popstate', function () { setTimeout(function () { ensureFocus(true); }, 250); });
    new MutationObserver(scheduleRefresh).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'aria-hidden', 'aria-modal']
    });
    setTimeout(function () { ensureFocus(true); }, 350);
    setInterval(function () { ensureFocus(false); }, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
