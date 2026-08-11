# Changelog

All notable changes to this project are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html) while the public API remains pre-1.0.

## [Unreleased]

### Fixed

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

[Unreleased]: https://github.com/Ticklect/goated-tizenbrew/compare/v0.4.1...HEAD
[0.4.1]: https://github.com/Ticklect/goated-tizenbrew/releases/tag/v0.4.1
[0.4.0]: https://github.com/Ticklect/goated-tizenbrew/releases/tag/v0.4.0
[0.3.2]: https://github.com/Ticklect/goated-tizenbrew/releases/tag/v0.3.2
[0.3.1]: https://github.com/Ticklect/goated-tizenbrew/releases/tag/v0.3.1
[0.3.0]: https://github.com/Ticklect/goated-tizenbrew/commit/2c0b043
[0.2.0]: https://github.com/Ticklect/goated-tizenbrew/commit/b04665e
[0.1.0]: https://github.com/Ticklect/goated-tizenbrew/commit/981fcdb
