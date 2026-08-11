## What changed

<!-- Summarize the implementation. -->

## Why it changed

<!-- Link the issue and explain the user-facing problem. -->

## Testing performed

<!-- List exact automated commands and manual checks. Do not write only "tested". -->

- [ ] `npm run validate`
- [ ] `android-tv/gradlew testDebugUnitTest lintDebug assembleDebug` (for Android changes)
- [ ] Module launch checked where applicable
- [ ] Remote/navigation behavior checked where applicable
- [ ] Playback/source behavior checked where applicable

## TV configurations tested

<!-- Use "Not device-tested" when appropriate; do not imply compatibility. -->

| Platform | TV/device model | OS and host/WebView version | Build version | Result |
| -------- | --------------- | --------------------------- | ------------- | ------ |
|          |                 |                             |               |        |

## Breaking changes

<!-- Write "None" or explain required migration/update steps. -->

## Screenshots

<!-- Required for visible UI changes when a redistributable screenshot is available. Otherwise explain why not. -->

## Checklist

- [ ] The change is focused and documented where needed.
- [ ] Tests cover deterministic behavior changed by this pull request.
- [ ] No secrets, cookies, signed URLs, private network details, logs, or generated caches are included.
- [ ] New code/assets/dependencies have known, compatible licenses and documented provenance.
- [ ] Third-party names and marks are not presented as project endorsement.
- [ ] Compatibility claims are backed by an identified test or clearly marked untested/reported.
- [ ] User-facing changes are included in `CHANGELOG.md`.
