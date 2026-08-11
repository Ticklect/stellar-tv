# Releasing

The project uses Semantic Versioning. While the project is below `1.0.0`, increment:

- Patch for compatible fixes, documentation, tests, and maintenance
- Minor for meaningful new behavior or intentional compatibility changes
- Major when a stable public contract is declared and later broken

## Release checklist

1. Choose the version and update `package.json`, `main.js`'s diagnostic `MODULE_VERSION`, and Android `appVersion` together. Run `npm run check:versions`.
2. Move relevant entries from `Unreleased` to a dated changelog heading.
3. Run `npm ci` and `npm run validate` from a clean checkout.
4. Run `android-tv/gradlew testDebugUnitTest lintDebug lintRelease assembleDebug assembleRelease` (use `gradlew.bat` on Windows).
5. Test launch, arrows, OK, Back, search, media keys, source loading, playback, and fullscreen on at least one documented device for every platform being released.
6. Inspect `npm pack --dry-run`, the Tizen ZIP, and Android APK metadata; confirm no secrets, logs, caches, signing material, or unrelated assets are included.
7. Commit the release preparation.
8. Create an annotated `v<version>` tag only after review. The tag workflow uploads both platform artifacts to the workflow run but does not publish a GitHub Release.
9. Manually create a GitHub Release only after reviewing both artifacts and notes derived from the changelog.
10. Verify the pinned GitHub identifier in TizenBrew and sideload the signed Android APK on a physical Android TV device.

Do not move or recreate an existing public tag. Do not publish an npm package until ownership, provenance, and the official package name are deliberately established.

## Current release

`v0.4.1` is the first release prepared through this checklist. It is a patch release over `v0.4.0`: runtime behavior remains compatible, while diagnostics, testability, licensing, and repository infrastructure improve. Its physical-TV test is recorded in [COMPATIBILITY.md](COMPATIBILITY.md). Existing tags must remain intact.

Version `0.5.0` is currently unreleased development work. Do not tag or publish it until the existing Tizen behavior is rechecked and the Android APK has passed the documented physical-device smoke test.
