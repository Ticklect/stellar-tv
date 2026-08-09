(function () {
  'use strict';

  const STYLE_ID = 'goated-tizenbrew-remote-style';
  const focusableSelector = [
    'a[href]', 'button', 'input', 'select', 'textarea',
    '[role="button"]', '[role="link"]', '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function visible(el) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
  }

  function focusables() {
    return Array.from(document.querySelectorAll(focusableSelector)).filter(visible);
  }

  function addFocusStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = ':focus { outline: 4px solid #72a7ff !important; outline-offset: 4px !important; }';
    document.head.appendChild(style);
  }

  function focusInitial() {
    if (document.activeElement && document.activeElement !== document.body && visible(document.activeElement)) return;
    const first = focusables()[0];
    if (first) first.focus({ preventScroll: true });
  }

  function move(direction) {
    const items = focusables();
    if (!items.length) return;
    const current = document.activeElement;
    const source = current && visible(current) ? current : items[0];
    const a = source.getBoundingClientRect();
    const ax = a.left + a.width / 2;
    const ay = a.top + a.height / 2;
    let best = null;
    let bestScore = Infinity;

    for (const item of items) {
      if (item === source) continue;
      const r = item.getBoundingClientRect();
      const bx = r.left + r.width / 2;
      const by = r.top + r.height / 2;
      const dx = bx - ax;
      const dy = by - ay;
      const primary = direction === 'left' ? -dx : direction === 'right' ? dx : direction === 'up' ? -dy : dy;
      if (primary <= 2) continue;
      const secondary = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);
      const score = primary + secondary * 2.5;
      if (score < bestScore) { best = item; bestScore = score; }
    }
    if (best) {
      best.focus({ preventScroll: false });
      best.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  function video() { return document.querySelector('video'); }

  function handleMedia(key) {
    const v = video();
    if (!v) return false;
    if (key === 'MediaPlayPause' || key === 'MediaPlay' || key === 'MediaPause') {
      if (key === 'MediaPlay' || (key === 'MediaPlayPause' && v.paused)) v.play().catch(() => {});
      else v.pause();
      return true;
    }
    if (key === 'MediaFastForward') { v.currentTime = Math.min(v.duration || Infinity, v.currentTime + 10); return true; }
    if (key === 'MediaRewind') { v.currentTime = Math.max(0, v.currentTime - 10); return true; }
    if (key === 'MediaStop') { v.pause(); v.currentTime = 0; return true; }
    return false;
  }

  function onKeyDown(event) {
    const key = event.key || event.code;
    if (handleMedia(key)) { event.preventDefault(); return; }
    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
      const active = document.activeElement;
      if (active && /INPUT|TEXTAREA|SELECT/.test(active.tagName) && key !== 'ArrowUp' && key !== 'ArrowDown') return;
      event.preventDefault();
      move(key.slice(5).toLowerCase());
      return;
    }
    if (key === 'Enter' || key === 'NumpadEnter') {
      const active = document.activeElement;
      if (active && (active.matches('button, a, [role="button"], [role="link"]') || active.onclick)) {
        event.preventDefault();
        active.click();
      }
      return;
    }
    if (key === 'Back' || key === 'BrowserBack' || key === 'XF86Back') {
      event.preventDefault();
      if (history.length > 1) history.back();
    }
  }

  function start() {
    addFocusStyle();
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('click', function (event) {
      if (event.target && event.target.focus) event.target.focus({ preventScroll: true });
    }, true);
    focusInitial();
    setInterval(focusInitial, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
