# Architecture

## Overview

The repository has two independent platform hosts around one remote-navigation contract. It does not host, mirror, scrape, index, proxy, or bundle the target website or its media.

TizenBrew reads the root `package.json`, opens `websiteURL`, registers the requested media keys, and injects root `main.js`. The script exits in nested frames so only the top-level Stellar document owns navigation and request interception.

The native Kotlin application under `android-tv/` opens the same live site in a fullscreen WebView. Its Gradle build copies root `main.js` into generated Android assets, preserving that proven script as the navigation source of truth without moving or duplicating the Tizen runtime file.

```text
TizenBrew module metadata
          |
          +--> opens https://stellar.gdn/
          |
          +--> injects main.js
                    |
                    +--> remote input and focus navigation
                    +--> video control
                    +--> rendering/performance tuning
                    +--> TV-only source-resolution worker

Android TV launcher
          |
          +--> secure fullscreen WebView opens https://stellar.gdn/
          |
          +--> native Android remote events
                    |
                    +--> generated copy of root main.js
                    +--> small native-to-web key dispatcher
                    +--> fullscreen video using WebView media audio focus
```

There is no backend, account system, database, analytics component, or bundled copy of the target website. The Tizen module has no runtime dependency, and the Android APK uses only Android platform APIs.

## Platform boundaries

Root `package.json`, `main.js`, and `app/index.html` remain the TizenBrew contract. Android-specific source, resources, tests, and Gradle files live under `android-tv/`. A version check fails when `package.json`, the Tizen diagnostic version, and Android `versionName` differ.

Android converts native key events into ordinary cancelable keyboard events understood by `main.js`. It uses native-to-web `evaluateJavascript`; it does not expose `addJavascriptInterface` or any privileged Java/Kotlin method to the page. Back first exits native fullscreen, then gives the shared page logic a chance to close a dialog or navigate, and finally leaves the activity when no web history remains.

The Android WebView permits only HTTPS Stellar pages in-app. Other HTTP(S) links are offered to an external browser, unsupported schemes are blocked, TLS errors are cancelled, and mixed content and file/content access are disabled. Cookies and DOM storage preserve normal website sessions, while third-party cookies and web permission requests remain disabled.

## Runtime entry and state

`main.js` is an immediately invoked function. It installs TV-only source acceleration before DOM startup, then waits for `DOMContentLoaded` when necessary. The shared `state` object tracks:

- Current focused element and preferred horizontal position
- Previous focus and active modal scope
- Mutation refresh timer
- DOM version and `WeakMap` candidate cache
- Whether the user has interacted
- Whether startup has already run

For compatibility with existing tooling, the diagnostic object remains available under the legacy internal name `window.__goatedTizenBrewDiagnostics`. It exposes the module version and only the most recent handled error summary.

## Remote input handling

TizenBrew registers media keys from `package.json`. A capturing `keydown` handler converts Samsung numeric key codes and browser key names through `normalizedKey()`.

Handling order matters:

1. Dedicated media keys are offered to `handleMedia()`.
2. Back closes the active layer, leaves text input, uses the player Back control, navigates browser history, or exits through the Tizen application API.
3. Arrow keys either move focus or seek when the player has no focused control.
4. Enter activates the focused control or toggles playback where appropriate.

Handled keys prevent default behavior and stop propagation to avoid duplicate page actions. Left and Right remain native inside text inputs so users can edit search text.

## Spatial navigation and focus mapping

`candidates()` queries visible anchors, controls, text fields, sliders, and explicitly focusable elements in the active scope. It removes utility scroll buttons, duplicate elements, and interactive descendants that occupy the same box as an interactive ancestor.

Candidate results are cached by scope in a `WeakMap`. The cache is associated with a DOM version that advances only when mutations may affect focusable elements or relevant visibility attributes.

Navigation has specialized paths before general geometry:

- Left/Right inside a content rail sorts only that rail's candidates by horizontal center.
- Up/Down from a rail selects the nearest rail in that direction, then the item closest to the remembered horizontal coordinate.
- Search Down selects Play, while Up from Play returns to the search field.
- General movement uses `directionalScore()`: forward distance plus a 3.25× off-axis penalty, with a four-pixel dead zone.

`setFocus()` applies the focus class, requests DOM focus, scrolls the item into view without smooth animation, and updates the preferred horizontal coordinate. A strong CSS outline makes focus visible independently of the target site's own focus style.

## Layers and focus restoration

`activeScope()` detects visible dialogs, modal elements, and sufficiently large fixed overlays. The highest z-index layer becomes the navigation boundary. When entering a layer, the module stores the originating element. After the layer closes, `ensureFocus()` restores that element when it remains visible.

A mutation observer schedules focus recovery after page updates. A delayed initial pass corrects focus after the target page finishes rendering, unless the user has already interacted.

## Video player control

The module finds the page's first HTML `video` element. Media keys call native `play()`, `pause()`, and `currentTime`; seek targets are clamped to zero and the known duration. A synthetic mouse-move event wakes controls that the target player hides during inactivity.

On `/watch/` routes, Left/Right seek 15 seconds when focus is not on a player button. Down can focus Play/Pause and Up can return to the player Back button. Playback promise failures are recorded in diagnostics and logged as one actionable warning.

## Source resolution and background work

Source acceleration is deliberately gated to:

- A `Tizen` or `SMART-TV` user agent
- The exact `stellar.gdn` hostname
- The top frame

The module wraps `window.fetch` and recognizes only the challenge, resolve, and subtitles endpoints at `api.reallyfast.xyz`. When the page requests a challenge, the wrapper starts computing the required SHA-256 prefix proof in one Web Worker, while returning an equivalent challenge payload with zero foreground difficulty. When the page submits the matching resolve/subtitle request, the wrapper waits for the actual worker nonce and substitutes it into a copied request body.

The worker searches at most 5,000,001 nonce values and is terminated after 14 seconds. It is single-worker by design: the goal is to move work off the UI thread without saturating TV CPU cores. Workers and blob URLs are always released when the promise settles.

No proof is skipped: the valid nonce is still computed and sent to the upstream API. If interception cannot parse a response or request, the original response/request path is preserved where possible and diagnostics records the failure.

## Performance optimizations

- Focus candidates are cached per active scope.
- Horizontal navigation searches the current rail instead of the full document.
- Vertical rail navigation avoids scoring every candidate in every direction.
- Smooth scrolling is disabled in TV mode.
- Expensive backdrop filters are disabled and transition durations reduced.
- Horizontal rails use `content-visibility` hints.
- Offscreen non-priority images receive asynchronous decoding and lazy loading.
- Proof-of-work runs outside the UI thread.

These optimizations are coupled to the target site's current DOM class patterns. Changes to Stellar may require selector maintenance.

## TizenBrew integration constraints

`package.json` declares `packageType: "mods"`, `websiteURL`, the injected `main`, and media keys. Version-pinned GitHub module identities are recommended because TizenBrew 2.0.5 may retain a previous injected script in memory.

The module intentionally does not enable `evaluateScriptOnDocumentStart`. TizenBrew 2.0.5's launch path for document-start GitHub modules has compatibility limitations, while normal injection occurs early enough on the root page for the single-page application's later watch-route requests.

`app/index.html` is a minimal redirect/fallback artifact. The current `mods` launch path is controlled by `websiteURL`, not `appPath`.
