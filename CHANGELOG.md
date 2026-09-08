# Changelog

All notable changes to this project are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html) while the public API remains pre-1.0.

## [Unreleased]

## [0.5.3] - 2026-09-08

### Changed

- Rebranded the user-facing Tizen and Android TV application from Goated to Stellar after the target website moved to `stellar.gdn`.
- Replaced the Android launcher icon with the provided Stellar star-and-orbit artwork.
- Renamed the repository/package metadata and release artifacts to Stellar naming while preserving the Android package ID and signing identity for upgrades.
- Updated GitHub/install links for the renamed `Ticklect/stellar-tv` repository.

### Fixed

- Point both TV hosts and trusted navigation policy at `https://stellar.gdn/`.

## [0.5.2] - 2026-08-13

### Added

- Broader Android TV remote mappings for controller Select/B/Start, keyboard Space/Escape, headset play/pause, alternate media seek/close keys, Menu, Info, and Captions.
- Focus discovery for ARIA switches, tabs, menu items, options, checkboxes, radios, comboboxes, and editable controls.
- Remote adjustment for native select controls, including disabled-option skipping and edge clamping.

### Fixed

- Restore v0.5.0's device-default Android WebView scaling. The density-derived zoom added in v0.5.1 shrank the entire site—including player controls—far below a readable size on some real TVs.
- Forward mapped Android keys back to the WebView when the TV layer does not handle them, preserving native control behavior.
- Register only media and shortcut keys that a Samsung TV reports as supported, with per-key fallback if batch registration fails.

## [0.5.1] - 2026-08-12

### Added

- Official goat artwork for density-specific legacy launcher icons, adaptive icons, and a dedicated 320 x 180 Android TV banner.
- Unit coverage for TV viewport scaling, modal navigation scoring, and native subtitle-slider stepping and clamping.

### Changed

- Scale the Android WebView for readable 720p, 1080p, and 4K TV layouts without changing the Tizen or website presentation.
- Prefer Play, Resume, or Watch as the initial Android TV focus target once delayed page content becomes available.

### Fixed

- Draw a high-contrast inset focus state on clipped poster surfaces, including Continue Watching cards.
- Route Android remote events to the focused control so native range inputs respond to Left and Right, while Up and Down continue through the settings dialog.
- Prefer the nearest settings row during vertical modal navigation and restore focus to the Settings button after the dialog closes.

## [0.5.0] - 2026-08-11

### Added

- Native Kotlin Android TV / Google TV host under `android-tv/` with a secure fullscreen WebView, launcher metadata, D-pad/media-key mapping, fullscreen-video handling, persistent sessions, and error recovery.
- Pure Android unit tests for remote-key mapping and trusted-navigation policy.
- Cross-platform version verification and CI builds for the Android debug APK.
- Tag-triggered workflow-artifact packaging for both TizenBrew and Android without automatic GitHub Release publication.

### Changed

- Prepared synchronized Tizen and Android development metadata for version `0.5.0`.
- Expanded architecture, compatibility, installation, signing, and third-party documentation for both platforms.

### Fixed

- Inject the Android TV navigation layer as soon as a trusted page becomes visible, so first-load dialogs respond to the remote before all page resources finish loading.
- Route Android 13+ predictive Back through a single callback, preventing duplicate Back events and accidental app exits after closing a dialog or returning from a title page.
- Let Chromium own Android media audio focus, preventing a redundant native focus request from immediately pausing resumed video.
- Split the canonical LGPLv3 and incorporated GPLv3 texts so GitHub can identify the repository license correctly while release packages include both documents.

## [0.4.1] - 2026-08-11

### Added

- Open-source governance, contribution, security, architecture, compatibility, roadmap, and release documentation.
- ESLint, Prettier, Node unit tests, CI, and weekly development-dependency updates.
- Runtime diagnostics for handled source-resolution and playback errors.

### Changed

- Prepared package metadata for `0.4.1` and `LGPL-3.0-only` licensing.
- Made the fallback page's punctuation encoding explicit through HTML entities.
- Standardized JavaScript, HTML, Markdown, JSON, and YAML formatting with Prettier.

## [0.4.0] - 2026-08-09

### Added

- Background proof-of-work worker for TV source resolution.
- Direct vertical movement between content rails.
- Lazy handling for offscreen images.

### Performance

- Cached focus candidates and limited horizontal navigation queries to the active rail.
- Reduced expensive TV blur and transition behavior.
- Switched focused-item scrolling to immediate behavior to reduce UI blocking.

## [0.3.2] - 2026-08-09

### Fixed

- Restored focus to the originating poster after closing a dialog.
- Improved initial Play focus and search-to-result navigation.

## [0.3.1] - 2026-08-09

### Fixed

- Hardened Samsung remote key normalization and media-key handling.

## [0.3.0] - 2026-08-09

### Added

- Netflix-style spatial navigation, visible focus indicators, modal behavior, search navigation, and video-player controls.

This version corresponds to commit `2c0b043`; it was not tagged in the repository.

## [0.2.0] - 2026-08-09

### Added

- Initial TV remote navigation module in `main.js`.

This version corresponds to commit `b04665e`; it was not tagged in the repository.

## [0.1.0] - 2026-08-09

### Added

- Initial TizenBrew package metadata and redirect/fallback page.

This version corresponds to commit `981fcdb`; it was not tagged in the repository.

[Unreleased]: https://github.com/Ticklect/goated-tizenbrew/compare/v0.5.2...HEAD
[0.5.2]: https://github.com/Ticklect/goated-tizenbrew/releases/tag/v0.5.2
[0.5.1]: https://github.com/Ticklect/goated-tizenbrew/releases/tag/v0.5.1
[0.5.0]: https://github.com/Ticklect/goated-tizenbrew/releases/tag/v0.5.0
[0.4.1]: https://github.com/Ticklect/goated-tizenbrew/releases/tag/v0.4.1
[0.4.0]: https://github.com/Ticklect/goated-tizenbrew/releases/tag/v0.4.0
[0.3.2]: https://github.com/Ticklect/goated-tizenbrew/releases/tag/v0.3.2
[0.3.1]: https://github.com/Ticklect/goated-tizenbrew/releases/tag/v0.3.1
[0.3.0]: https://github.com/Ticklect/goated-tizenbrew/commit/2c0b043
[0.2.0]: https://github.com/Ticklect/goated-tizenbrew/commit/b04665e
[0.1.0]: https://github.com/Ticklect/goated-tizenbrew/commit/981fcdb
