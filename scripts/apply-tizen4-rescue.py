from pathlib import Path

path = Path('main.js')
source = path.read_text(encoding='utf-8')
if 'function isTizen4RescueMode(' in source:
    raise SystemExit('Tizen 4 rescue mode is already present; refusing to patch twice.')

anchor = "  if (disableTizenSiteAds()) return;\n"
if source.count(anchor) != 1:
    raise SystemExit('Expected ad-gate anchor exactly once.')

rescue = r'''

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
      'html.goated-tizen4-rescue .goated-tizen4-card img { display: block !important; width: 176px !important; height: 264px !important; object-fit: cover !important; border-radius: 10px !important; background: #171b24 !important; }',
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
      root.tagName === 'A'
        ? [root]
        : Array.prototype.slice.call(root.querySelectorAll('a[href]'));
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
'''

source = source.replace(anchor, anchor + rescue, 1)

rail_anchor = "element.closest('.row-scroll, [class*=\"overflow-x-auto\"]')"
if source.count(rail_anchor) != 1:
    raise SystemExit('Expected rail selector anchor exactly once.')
source = source.replace(
    rail_anchor,
    "element.closest('.row-scroll, [class*=\"overflow-x-auto\"], .goated-tizen4-rail')",
    1,
)

list_anchor = ".call(scope.querySelectorAll('.row-scroll, [class*=\"overflow-x-auto\"]'))"
if source.count(list_anchor) != 1:
    raise SystemExit('Expected rail-list selector anchor exactly once.')
source = source.replace(
    list_anchor,
    ".call(scope.querySelectorAll('.row-scroll, [class*=\"overflow-x-auto\"], .goated-tizen4-rail'))",
    1,
)

start_anchor = "    document.documentElement.classList.add('goated-tv-mode');\n"
if source.count(start_anchor) != 1:
    raise SystemExit('Expected start anchor exactly once.')
source = source.replace(
    start_anchor,
    start_anchor + "    if (tizen4RescueActive) installTizen4RescueMode();\n",
    1,
)

observer_anchor = """      records.forEach(function (record) {
        Array.prototype.forEach.call(record.addedNodes || [], tuneImages);
      });
"""
if source.count(observer_anchor) != 1:
    raise SystemExit('Expected mutation observer anchor exactly once.')
observer_replacement = """      records.forEach(function (record) {
        Array.prototype.forEach.call(record.addedNodes || [], function (node) {
          tuneImages(node);
          if (tizen4RescueActive) applyTizen4RescueClasses(node);
        });
      });
"""
source = source.replace(observer_anchor, observer_replacement, 1)
path.write_text(source, encoding='utf-8')
