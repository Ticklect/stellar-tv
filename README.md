# Stellar TV Compatibility Layer

[![License: LGPL-3.0-only](https://img.shields.io/badge/license-LGPL--3.0--only-blue.svg)](LICENSE)
[![CI](https://github.com/Ticklect/stellar-tv/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Ticklect/stellar-tv/actions/workflows/ci.yml)
[![Latest release](https://img.shields.io/github/v/release/Ticklect/stellar-tv)](https://github.com/Ticklect/stellar-tv/releases/latest)

This independent project makes the Stellar web interface easier to use with a television remote. One repository produces two platform builds while leaving the website itself hosted and operated separately by Stellar.

| Platform               | Build                     | Start here                                          |
| ---------------------- | ------------------------- | --------------------------------------------------- |
| Samsung Tizen          | TizenBrew module          | [TizenBrew installation](#samsung-tizen--tizenbrew) |
| Android TV / Google TV | Native Kotlin WebView APK | [Android TV sideloading](#android-tv--google-tv)    |

The project does not scrape, mirror, index, proxy, or bundle Stellar's pages or media. Both builds open the live `https://stellar.gdn/` site and add TV input compatibility around it.

## Features

- Samsung/Tizen and Android TV D-pad navigation across the header, content rails, dialogs, search, and player
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
- Internet access from the TV to `stellar.gdn`, `api.reallyfast.xyz`, and the media hosts selected by Stellar
- A PC and TV on the same local network for initial TizenBrew installation, where required by the TizenBrew installer
- No runtime npm dependencies

### Android TV / Google TV

- An Android TV or Google TV device running Android 6.0 (API 23) or newer
- A reasonably current Android System WebView implementation
- Internet access from the TV to Stellar and the media hosts selected by the website
- **Downloader by AFTVnews** for the recommended installation method

Android TV hardware has not yet been physically validated for this project. The APK compiles, its pure navigation/key-policy tests pass, and launch, D-pad, Select, Back, source loading, 1080p playback, fullscreen exit, and media-key behavior have been validated on an Android TV API 36 emulator. Actual-device behavior must still be recorded before Android hardware support is described as confirmed.

See [compatibility](docs/COMPATIBILITY.md) for the evidence-based device matrix. The target website and source providers can change independently, so a previously working release may require maintenance.

## Installation

### Samsung Tizen / TizenBrew

#### 1. Install TizenBrew

Follow the upstream [TizenBrew installation guide](https://github.com/reisxd/TizenBrew/blob/main/docs/README.md). TV developer mode and installation are TizenBrew requirements, not features of this repository.

#### 2. Install this module from GitHub

1. Open TizenBrew on the TV.
2. Open the module manager and choose the GitHub source.
3. Enter `Ticklect/stellar-tv@0.5.3` for the latest published release.
4. Confirm that **Stellar** appears with version **0.5.3**, then launch it.

Pinning a version is recommended because it makes updates deliberate and avoids stale module-script identities in TizenBrew 2.0.5.

#### npm installation

TizenBrew supports npm-backed modules in general, but `stellar-tv` is not currently published to the npm registry. Do not use an npm package with this name unless the repository maintainers announce and link an official package. GitHub installation is the supported method today.

#### Updating

1. Read [CHANGELOG.md](CHANGELOG.md).
2. Remove the old module entry in TizenBrew.
3. Add the new version-pinned GitHub identifier.
4. Confirm the displayed version before testing navigation and playback.

Using a new explicit version is important because TizenBrew 2.0.5 can retain an injected script in memory under the previous module identity.

### Android TV / Google TV

#### Recommended: Downloader app

This is the easiest installation method and does not require a computer:

1. Install and open **Downloader by AFTVnews** on the Android TV or Google TV device.
2. Use the current Stellar Downloader code listed in this section after the v0.5.3 release is published.
3. Download the Stellar TV APK.
4. If Android asks for permission, allow Downloader to install unknown apps.
5. Return to Downloader and install the APK.
6. Launch **Stellar TV** from the TV's Apps screen.

#### Alternative: direct GitHub download

Download the signed [`stellar-android-tv-v0.5.3.apk`](https://github.com/Ticklect/stellar-tv/releases/download/v0.5.3/stellar-android-tv-v0.5.3.apk) directly from [GitHub Release v0.5.3](https://github.com/Ticklect/stellar-tv/releases/tag/v0.5.3).

#### Alternative: ADB installation

Developers and advanced users can install the downloaded release APK through ADB:

```sh
adb install -r stellar-android-tv-v0.5.3.apk
```

For ADB setup, troubleshooting, and the collapsed developer/debug build instructions, see the [complete Android TV installation guide](android-tv/README.md#install-on-an-android-tv-or-google-tv).

## Remote controls

| Remote input              | Behavior                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| D-pad / arrow keys        | Move spatial focus; Left/Right adjust a focused slider; seek on a player without a focused control                       |
| OK / Enter / controller A | Activate the focused item; toggle playback on the player when appropriate                                                |
| Back                      | Close the active layer, leave a text field, use the player's Back control, navigate history, or exit as a final fallback |
| Play / Pause / Play-Pause | Control the active video                                                                                                 |
| Fast-forward / Rewind     | Seek forward or backward 15 seconds                                                                                      |
| Next / Previous track     | Seek forward or backward 15 seconds                                                                                      |
| Stop                      | Pause and return the video to the beginning                                                                              |
| Menu / controller Start   | Open the website's Settings/Menu control when available                                                                  |
| Info                      | Open the focused page's Info/Details control when available                                                              |
| Captions                  | Open the player's Captions/Subtitles control when available                                                              |
| Space / controller Select | Alternative activation keys for keyboard-style and gamepad remotes                                                       |
| Escape / controller B     | Alternative Back keys for keyboard-style and gamepad remotes                                                             |

### Android remote compatibility

The Android APK handles standard Android TV key codes rather than identifying a remote brand. It is therefore expected to work with remotes for Google TV Streamer, Chromecast with Google TV, NVIDIA Shield TV, Xiaomi TV boxes/sticks, onn. Google TV devices, and Sony, TCL, Hisense, or Philips Android/Google TVs when those remotes report the standard D-pad, Select, Back, or media keys. Generic Bluetooth/USB remotes, game controllers, and HDMI-CEC TV remotes are also expected to work when Android maps their controls to those standard keys.

These physical remote models are expected-compatible, not yet project-confirmed. Only the Android TV API 36 emulator has been directly validated. Voice assistant, volume, power, TV input, channel, guide, number, and colored buttons are intentionally not captured by this app; Android or the television handles them independently.

## Development

Node.js is used for shared repository tooling and Tizen tests. Gradle builds the native Android TV host. TizenBrew still injects the root `main.js` directly in the TV browser.

```sh
git clone https://github.com/Ticklect/stellar-tv.git
cd stellar-tv
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

The Tizen module runs only in the top frame. It discovers visible interactive DOM elements, maps remote events to browser/Tizen key names, manages a CSS focus class, and controls the page's HTML video element. The Android app securely hosts the real Stellar site in a fullscreen WebView and converts native TV key events into that same navigation contract without exposing a JavaScript-to-native bridge. Tizen-only source acceleration remains gated to Tizen/Smart TV user agents. See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Diagnostics

The module records only its most recent handled runtime error at the legacy internal compatibility key:

```js
window.__goatedTizenBrewDiagnostics;
```

The object contains the module version plus an error area, message, and timestamp. It does not intentionally contain requests, media URLs, cookies, tokens, or challenge values. Include the redacted object in a bug report when developer tools are available.

## Troubleshooting

### The module does not appear

- Confirm the GitHub identifier and capitalization: `Ticklect/stellar-tv@<version>`.
- Confirm the TV has network access and TizenBrew can reach jsDelivr/GitHub-backed module files.
- If TizenBrew shows **Unknown Module**, remove the entry and add the complete identifier again.

### An old version still loads

- Remove the existing entry and install the new version-pinned identifier.
- Confirm the version shown by TizenBrew before launching.
- Fully close and reopen TizenBrew if its service retained the old module in memory.

### Remote controls do not respond or focus is misplaced

- Confirm the module, rather than the unmodified Stellar site, was launched.
- Wait for the page content to finish appearing; the module performs a delayed focus refresh.
- Press an arrow key once to establish focus. If a reproducible page layout still fails, report the route and the focused/expected elements.

### Video controls do not work

- Start playback from Stellar's Play action first so a video element exists.
- Test the OK button and the dedicated media keys separately; remote layouts vary.
- Report the exact key, player state, TV model, and visible error.

### Source loading takes too long or fails

- Allow several seconds for source resolution; the background worker has a 14-second limit.
- Try another source offered by Stellar. Individual titles or providers may have no working source.
- Confirm the TV can reach the network hosts listed in Requirements.
- If developer tools are available, include `window.__goatedTizenBrewDiagnostics` after removing anything sensitive.

## Contributing

Bug reports, device compatibility results, tests, and focused fixes are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and follow the [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request.

## License

Copyright (C) 2026 Ticklect contributors. Original code in this repository is licensed under the [GNU Lesser General Public License v3.0 only](LICENSE) (`LGPL-3.0-only`), incorporating the [GNU General Public License v3.0 terms](LICENSE.GPL). The license does not grant rights to Stellar's website, media, names, third-party APIs, Samsung/Tizen, TizenBrew, Google, Android, Google TV, or assets owned by others. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Disclaimer and project identity

This is an independent community project. It is not affiliated with, endorsed by, sponsored by, or operated by Samsung, the Tizen project, TizenBrew, Google, Android, Google TV, Stellar, or Stellar's operators. All third-party names and marks belong to their respective owners.

Forks and modified versions are welcome under the license, but they should clearly state that they are modified and must not falsely present themselves as this upstream project or as an official product of any named third party. This is a provenance notice, not a restriction on the open-source rights granted by the license.
