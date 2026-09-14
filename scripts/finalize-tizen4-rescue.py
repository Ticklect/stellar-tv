from pathlib import Path


def replace_once(path, old, new):
    file_path = Path(path)
    source = file_path.read_text(encoding='utf-8')
    if source.count(old) != 1:
        raise SystemExit(f'Expected exactly one patch anchor in {path!r}.')
    file_path.write_text(source.replace(old, new, 1), encoding='utf-8')


replace_once(
    'main.js',
    "      'html.goated-tizen4-rescue .goated-tizen4-card img { display: block !important; width: 176px !important; height: 264px !important; object-fit: cover !important; border-radius: 10px !important; background: #171b24 !important; }',",
    "      'html.goated-tizen4-rescue .goated-tizen4-card img { position: static !important; top: auto !important; right: auto !important; bottom: auto !important; left: auto !important; display: block !important; width: 176px !important; height: 264px !important; object-fit: cover !important; border-radius: 10px !important; background: #171b24 !important; }',",
)

replace_once(
    'README.md',
    """Samsung maps Tizen 4.0 to Chromium 56. Stellar's current live web build uses CSS cascade layers and JavaScript syntax newer than that engine can parse, so a JavaScript polyfill inside this module cannot make the full site compatible. See [compatibility](docs/COMPATIBILITY.md) for the current evidence.

The Tizen module itself remains parseable as ES2017 and disables Stellar's optional click-ad setting before a clean reload, which addresses unrelated-site popunder/redirect behavior. Full browsing and playback on Tizen 4 still require Stellar to provide a legacy browser build or another delivery path that transpiles the complete site runtime and CSS for Chromium 56.
""",
    """Samsung maps Tizen 4.0 to Chromium 56. Stellar's current live web build uses CSS cascade layers and JavaScript syntax newer than that engine can parse, so ordinary API polyfills cannot make the modern Next.js/Tailwind client bundle run unchanged. See [compatibility](docs/COMPATIBILITY.md) for the current evidence.

On Tizen 4 only, the module now enables a rescue layer after the ad-disabled clean reload. It applies a Chromium-56-safe fallback layout to Stellar's server-rendered markup, identifies poster cards and horizontal rails, and forces safe same-site links through full-page navigation so browsing does not depend on the modern Next.js client router. The rescue layer is deliberately isolated from newer Tizen versions and Android TV.

This fallback does not transpile Stellar's downloaded JavaScript. Routes or playback flows that exist only inside the modern client bundle can still require an upstream legacy build or a dedicated legacy frontend. Until the rescue path is exercised on physical Tizen 4 hardware, compatibility remains **Reported**, not **Confirmed**.
""",
)

replace_once(
    'docs/ARCHITECTURE.md',
    """The module itself is kept within an ES2017 parser target to reduce syntax incompatibility with older Samsung web engines. That does not make the hosted website legacy-compatible. Initial parser-discovered JavaScript and CSS assets are fetched and parsed by the browser before a normal site-modification script can transform their response bytes; current Stellar assets that require newer syntax or CSS therefore need a compatible upstream build or a separate transformed delivery path.
""",
    """The module itself is kept within an ES2017 parser target to reduce syntax incompatibility with older Samsung web engines. Initial parser-discovered JavaScript and CSS assets are still fetched and parsed by the browser before a normal site-modification script can transform their response bytes, so the module does not attempt to transpile Stellar's modern client bundle.

For Tizen 4.0 specifically, `main.js` instead activates a rescue path after DOM startup. The path injects a Chromium-56-safe fallback stylesheet, classifies server-rendered poster links into navigable cards/rails, reapplies those classifications to added DOM nodes, and intercepts safe same-origin anchor activation in the capture phase to force a full document navigation before the unusable modern client router runs. This can recover server-rendered browsing without changing the delivery architecture; client-only routes and playback still depend on what the upstream site exposes to that old engine.
""",
)
