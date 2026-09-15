import fs from 'node:fs';

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`Could not find ${label}`);
  if (source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Found more than one ${label}`);
  }
  return source.slice(0, first) + after + source.slice(first + before.length);
}

const mainPath = new URL('../main.js', import.meta.url);
let main = fs.readFileSync(mainPath, 'utf8');

main = replaceOnce(
  main,
  `    previousScope: null,
    previousFocus: null,
    mutationTimer: null,`,
  `    previousScope: null,
    previousFocus: null,
    focusMemory: typeof WeakMap === 'function' ? new WeakMap() : null,
    mutationTimer: null,`,
  'focus memory state'
);

main = replaceOnce(
  main,
  `  function isVisible(element) {
    if (!element || !element.isConnected || element.disabled) return false;
    if (element.getAttribute('aria-hidden') === 'true') return false;
    var rect = rectOf(element);
    if (rect.width < 2 || rect.height < 2) return false;
    var style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }`,
  `  function isHiddenByAncestor(element) {
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
  }`,
  'visibility filter'
);

main = replaceOnce(
  main,
  `  function setFocus(element, preservePreferredX) {
    if (!element || !isVisible(element)) return false;
    var previousPreferredX = state.preferredX;
    if (state.current !== element) clearFocusDecoration();
    state.current = element;
    element.classList.add(FOCUS_CLASS);
    state.focusSurface = focusSurfaceFor(element);
    if (state.focusSurface) state.focusSurface.classList.add(FOCUS_SURFACE_CLASS);
    safeFocus(element, { preventScroll: true });
    scrollToElement(element);
    state.preferredX = preservePreferredX ? previousPreferredX : centerOf(element).x;
    return true;
  }

  function focusedElement() {
    if (state.current && isVisible(state.current) && state.current.classList.contains(FOCUS_CLASS))
      return state.current;
    if (
      document.activeElement &&
      document.activeElement !== document.body &&
      isVisible(document.activeElement)
    ) {
      state.current = document.activeElement;
      state.current.classList.add(FOCUS_CLASS);
      return state.current;
    }
    return null;
  }`,
  `  function setFocus(element, preservePreferredX) {
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
  }`,
  'focus commit behavior'
);

main = replaceOnce(
  main,
  `  function ensureFocus(force) {
    var scope = activeScope();
    if (scope !== state.previousScope) {
      if (
        scope !== document.body &&
        state.previousScope &&
        state.current &&
        state.previousScope.contains(state.current)
      ) {
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
  }`,
  `  function rememberFocusForScope(scope, element) {
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
  }`,
  'scope focus restoration'
);

main = replaceOnce(
  main,
  `    state.previousFocus = null;
    state.previousScope = null;`,
  `    state.previousFocus = null;
    state.focusMemory = typeof WeakMap === 'function' ? new WeakMap() : null;
    state.previousScope = null;`,
  'route focus reset'
);

main = replaceOnce(
  main,
  `      if (isAndroidTv && isSlider(active) && (key === 'ArrowLeft' || key === 'ArrowRight')) {
        adjustSlider(active, key === 'ArrowLeft' ? 'left' : 'right');`,
  `      if (
        isSlider(active) &&
        (isAndroidTv || active.tagName !== 'INPUT') &&
        (key === 'ArrowLeft' || key === 'ArrowRight')
      ) {
        adjustSlider(active, key === 'ArrowLeft' ? 'left' : 'right');`,
  'cross-platform slider routing'
);

main = replaceOnce(
  main,
  `  function scheduleRefresh(records) {
    var routeChanged = resetFocusForRoute();
    if (
      records &&
      records.some(function (record) {
        if (record.type === 'attributes') {
          return record.attributeName !== 'class' && record.attributeName !== 'style';
        }
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
      })
    )
      state.domVersion += 1;`,
  `  function normalizedCandidateClass(value) {
    var owned = [FOCUS_CLASS, FOCUS_SURFACE_CLASS, VIDEO_CARD_CLASS, VIDEO_RAIL_CLASS];
    return String(value || '')
      .split(/\\s+/)
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
    if (records && records.some(candidateMutationAffectsCache)) state.domVersion += 1;`,
  'candidate cache invalidation'
);

main = replaceOnce(
  main,
  `      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'aria-hidden', 'aria-modal']
    });`,
  `      attributes: true,
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
    });`,
  'mutation observer eligibility attributes'
);

fs.writeFileSync(mainPath, main);

const activityPath = new URL(
  '../android-tv/app/src/main/java/io/github/ticklect/goatedtv/MainActivity.kt',
  import.meta.url
);
let activity = fs.readFileSync(activityPath, 'utf8');
activity = replaceOnce(
  activity,
  `        val script = "window.__goatedAndroidTvDispatch?.(" +
            "\${jsString(remoteKey.key)},\${remoteKey.keyCode}) === true"`,
  `        val script = "(typeof window.__goatedAndroidTvDispatch === \\"function\\") && " +
            "window.__goatedAndroidTvDispatch(\${jsString(remoteKey.key)},\${remoteKey.keyCode}) === true"`,
  'Android WebView dispatch expression'
);
fs.writeFileSync(activityPath, activity);

const polishTestPath = new URL('../test/remote-polish.test.mjs', import.meta.url);
let polishTest = fs.readFileSync(polishTestPath, 'utf8');
polishTest = polishTest.replace(
  /^  assert\.match\(activity, \/typeof window.*__goatedAndroidTvDispatch.*$/m,
  '  assert.match(activity, /typeof window\\.__goatedAndroidTvDispatch/);'
);
fs.writeFileSync(polishTestPath, polishTest);

console.log('Applied remote-control polish patch.');
