# Roadmap

The roadmap describes useful directions, not commitments or release promises. Priorities should follow reproducible user reports and maintainer capacity.

## Near term

- Collect exact TV model, Tizen version, and TizenBrew version results in the compatibility table.
- Add fixtures for representative home, search, dialog, and player DOM structures.
- Cover focus restoration, modal boundaries, and source-request interception with automated tests.
- Add a user-accessible diagnostics view that excludes URLs, credentials, and source data.
- Document a repeatable physical-TV smoke-test checklist.
- Validate the Android APK on identified Android TV and Google TV hardware, including fullscreen video, media codecs, and common remotes.

## Later

- Investigate navigation edge cases caused by target-site layout changes.
- Test additional Samsung remotes and standards-based keyboard/controller inputs.
- Profile focus discovery and image handling on older Tizen browser engines.
- Improve accessible labels and announcements without conflicting with the target page.
- Track compatibility with later TizenBrew versions and document migration needs.
- Test Android System WebView updates and controller mappings without weakening the WebView security boundary.

## Explicitly out of scope

- Hosting, indexing, or redistributing media
- Pretending to be an official Samsung, TizenBrew, Google, Android, Google TV, or Goated client
- Analytics or telemetry without a separate, transparent proposal and consent model
- Claims of compatibility that are not backed by a reported or confirmed test
