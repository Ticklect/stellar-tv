# Goated TV Compatibility Layer

[![License: LGPL-3.0-only](https://img.shields.io/badge/license-LGPL--3.0--only-blue.svg)](LICENSE)
[![CI](https://github.com/Ticklect/goated-tizenbrew/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Ticklect/goated-tizenbrew/actions/workflows/ci.yml)
[![Latest release](https://img.shields.io/github/v/release/Ticklect/goated-tizenbrew)](https://github.com/Ticklect/goated-tizenbrew/releases/latest)

This independent project makes the Goated web interface easier to use with a television remote. One repository produces two platform builds while leaving the website itself hosted and operated by Goated:

| Platform               | Build                     | Start here                                          |
| ---------------------- | ------------------------- | --------------------------------------------------- |
| Samsung Tizen          | TizenBrew module          | [TizenBrew installation](#samsung-tizen--tizenbrew) |
| Android TV / Google TV | Native Kotlin WebView APK | [Android TV sideloading](#android-tv--google-tv)    |

The project does not scrape, mirror, index, proxy, or bundle Goated's pages or media. Both builds open the live `https://goated.cx/` site and add TV input compatibility around it.

## Features

- Samsung remote arrow-key navigation across the header, content rails, dialogs, search, and player
- Spatial, TV-style focus selection with direct movement between horizontal rails
- High-contrast focus indicators and automatic focus recovery after page updates
- OK/Enter activation and modal-aware Back-button behavior
- Focus restoration to the originating poster after a dialog closes
- Search-field navigation to and from the primary Play action
- Play, Pause, Play/Pause, Stop, 15-second seek, and track-key mappings
- Cached focus candidate maps and rail-local candidate searches
- Lazy handling of offscreen images, reduced backdrop blur, and shorter TV transitions
- Background proof-of-work processing for source resolution on Tizen/Smart TV user agents
- Source-request diagnostics without routine production log noise
- TizenBrew `mods` packaging with versioned GitHub installation support
- Android TV launcher, secure WebView host, fullscreen-video handling, and D-pad/media-key mapping

## Screenshots

No verified screenshots are currently checked in. Contributors may add real device screenshots to [`docs/screenshots/`](docs/screenshots/README.md); include the TV model, Tizen version if known, TizenBrew version, and module version with each image. Do not submit copyrighted promotional artwork or misleading mockups as product screenshots.

## Platform requirements

### Samsung Tizen

- A Samsung TV capable of running TizenBrew
- TizenBrew 2.0.5 for the confirmed setup; other TizenBrew versions are currently untested
- Internet access from the TV to `goated.cx`, `api.reallyfast.xyz`, and the media hosts selected by Goated
- A PC and TV on the same local network for initial TizenBrew installation, where required by the TizenBrew installer
- No runtime npm dependencies

### Android TV / Google TV

- An Android TV or Google TV device running Android 6.0 (API 23) or newer
- A reasonably current Android System WebView implementation
- Internet access from the TV to Goated and the media hosts selected by the website
- A computer with ADB for sideloading a development or release APK

Android TV hardware has not yet been physically validated for this project. The APK compiles, its pure navigation/key-policy tests pass, and launch, D-pad, Select, Back, source loading, 1080p playback, fullscreen exit, and media-key behavior have been validated on an Android TV API 36 emulator. Actual-device behavior must still be recorded before Android hardware support is described as confirmed.

See [compatibility](docs/COMPATIBILITY.md) for the evidence-based device matrix. The target website and source providers can change independently, so a previously working release may require maintenance.

## Installation

### Samsung Tizen / TizenBrew

#### 1. Install TizenBrew

Follow the upstream [TizenBrew installation guide](https://github.com/reisxd/TizenBrew/blob/main/docs/README.md). TV developer mode and installation are TizenBrew requirements, not features of this repository.

#### 2. Install this module from GitHub

1. Open TizenBrew on the TV.
2. Open the module manager and choose the GitHub source.
3. Enter `Ticklect/goated-tizenbrew@0.4.1` for the latest published Tizen release. Version `0.5.0` remains unreleased development code until both platform builds are reviewed.
4. Confirm that **Goated** appears with the expected version, then launch it.

Pinning a version is recommended because it makes updates deliberate and avoids stale module-script identities in TizenBrew 2.0.5.

#### npm installation

TizenBrew supports npm-backed modules in general, but `goated-tizenbrew` is not currently published to the npm registry. Do not use an npm package with this name unless the repository maintainers announce and link an official package. GitHub installation is the supported method today.

#### Updating

1. Read [CHANGELOG.md](CHANGELOG.md).
2. Remove the old Goated module entry in TizenBrew.
3. Add the new version-pinned GitHub identifier.
4. Confirm the displayed version before testing navigation and playback.

Using a new explicit version is important because TizenBrew 2.0.5 can retain an injected script in memory under the previous module identity.

### Android TV / Google TV

No Android APK has been publicly released yet. To build and sideload the development version:

1. Install Android Studio or the Android SDK command-line tools, including Android SDK Platform 36 and Build Tools 36.0.0.
2. From `android-tv/`, run `./gradlew assembleDebug` on macOS/Linux or `gradlew.bat assembleDebug` on Windows.
3. Enable developer options and USB/network debugging on the Android TV device.
4. Connect with ADB, approve the debugging prompt shown by the TV, then run:

   ```sh
   adb install -r android-tv/app/build/outputs/apk/debug/app-debug.apk
   ```

5. Launch **Goated TV (Unofficial)** from the TV apps screen.

Debug APKs are signed only with the local Android debug key and are intended for testing. Release-signing environment variables are documented in [android-tv/README.md](android-tv/README.md); signing keys and passwords must never be committed.

## Remote controls

| Remote input              | Behavior                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Arrow keys                | Move spatial focus; seek on a player without a focused control                                                           |
| OK / Enter                | Activate the focused item; toggle playback on the player when appropriate                                                |
| Back                      | Close the active layer, leave a text field, use the player's Back control, navigate history, or exit as a final fallback |
| Play / Pause / Play-Pause | Control the active video                                                                                                 |
| Fast-forward / Rewind     | Seek forward or backward 15 seconds                                                                                      |
| Next / Previous track     | Seek forward or backward 15 seconds                                                                                      |
| Stop                      | Pause and return the video to the beginning                                                                              |

## Development

Node.js is used for shared repository tooling and Tizen tests. Gradle builds the native Android TV host. TizenBrew still injects the root `main.js` directly in the TV browser.

```sh
git clone https://github.com/Ticklect/goated-tizenbrew.git
cd goated-tizenbrew
npm ci
npm run validate
cd android-tv
./gradlew testDebugUnitTest lintDebug assembleDebug
```

Available commands:

| Command                  | Purpose                                                                 |
| ------------------------ | ----------------------------------------------------------------------- |
| `npm test`               | Run Node's unit tests against instrumented copies of the shipped module |
| `npm run lint`           | Run ESLint over browser and test code                                   |
| `npm run format:check`   | Verify Prettier formatting                                              |
| `npm run build`          | Validate the release package with `npm pack --dry-run`                  |
| `npm run check:versions` | Confirm Tizen and Android metadata use the same version                 |
| `npm run validate`       | Run formatting, linting, tests, and package validation                  |

Project layout:

| Path             | Purpose                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| `main.js`        | TizenBrew-injected module and runtime entry point                      |
| `package.json`   | TizenBrew metadata, version, key registration, and development scripts |
| `app/index.html` | Small redirect/fallback page retained for packaging compatibility      |
| `test/`          | Unit tests for deterministic runtime behavior                          |
| `docs/`          | Architecture, compatibility, and screenshot guidance                   |
| `android-tv/`    | Native Kotlin Android TV application, tests, and Gradle wrapper        |
| `.github/`       | CI, issue forms, pull-request template, and dependency updates         |

The Tizen module runs only in the top frame. It discovers visible interactive DOM elements, maps remote events to browser/Tizen key names, manages a CSS focus class, and controls the page's HTML video element. The Android app securely hosts the real site in a fullscreen WebView and converts native TV key events into that same navigation contract without exposing a JavaScript-to-native bridge. Tizen-only source acceleration remains gated to Tizen/Smart TV user agents. See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Diagnostics

The module records only its most recent handled runtime error at:

```js
window.__goatedTizenBrewDiagnostics;
```

The object contains the module version plus an error area, message, and timestamp. It does not intentionally contain requests, media URLs, cookies, tokens, or challenge values. Include the redacted object in a bug report when developer tools are available.

## Troubleshooting

### The module does not appear

- Confirm the GitHub identifier and capitalization: `Ticklect/goated-tizenbrew@<version>`.
- Confirm the TV has network access and TizenBrew can reach jsDelivr/GitHub-backed module files.
- If TizenBrew shows **Unknown Module**, remove the entry and add the complete identifier again.

### An old version still loads

- Remove the existing entry and install the new version-pinned identifier.
- Confirm the version shown by TizenBrew before launching.
- Fully close and reopen TizenBrew if its service retained the old module in memory.

### Remote controls do not respond or focus is misplaced

- Confirm the module, rather than the unmodified Goated site, was launched.
- Wait for the page content to finish appearing; the module performs a delayed focus refresh.
- Press an arrow key once to establish focus. If a reproducible page layout still fails, report the route and the focused/expected elements.

### Video controls do not work

- Start playback from Goated's Play action first so a video element exists.
- Test the OK button and the dedicated media keys separately; remote layouts vary.
- Report the exact key, player state, TV model, and visible error.

### Source loading takes too long or fails

- Allow several seconds for source resolution; the background worker has a 14-second limit.
- Try another source offered by Goated. Individual titles or providers may have no working source.
- Confirm the TV can reach the network hosts listed in Requirements.
- If developer tools are available, include `window.__goatedTizenBrewDiagnostics` after removing anything sensitive.

## Contributing

Bug reports, device compatibility results, tests, and focused fixes are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and follow the [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request.

## License

Copyright (C) 2026 Ticklect contributors. Original code in this repository is licensed under the [GNU Lesser General Public License v3.0 only](LICENSE) (`LGPL-3.0-only`), incorporating the [GNU General Public License v3.0 terms](LICENSE.GPL). The license does not grant rights to Goated's website, media, names, third-party APIs, Samsung/Tizen, TizenBrew, Google, Android, Google TV, or assets owned by others. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Disclaimer and project identity

This is an independent community project. It is not affiliated with, endorsed by, sponsored by, or operated by Samsung, the Tizen project, TizenBrew, Google, Android, Google TV, Goated, or Goated's operators. All third-party names and marks belong to their respective owners.

Forks and modified versions are welcome under the license, but they should clearly state that they are modified and must not falsely present themselves as this upstream project or as an official product of any named third party. This is a provenance notice, not a restriction on the open-source rights granted by the license.
