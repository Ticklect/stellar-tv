# Compatibility

Statuses are evidence labels:

- **Confirmed** — tested directly for this project with the listed result.
- **Reported** — a user report exists, but the maintainers have not reproduced it.
- **Untested** — no project-specific result is available.

| Device / Tizen version                              | TizenBrew version | Status    | Notes                                                                                                             |
| --------------------------------------------------- | ----------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| Samsung UE50U8000…KXXU / Tizen version not recorded | 2.0.5             | Confirmed | Remote navigation, title selection, source loading, and video playback confirmed with module 0.4.1 on 2026-08-11. |
| Other Samsung/Tizen configurations                  | Other versions    | Untested  | Do not infer support from the confirmed device. Reports are welcome.                                              |

## Android TV / Google TV

| Device / Android version                          | Build | Status    | Notes                                                                                                                                       |
| ------------------------------------------------- | ----- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Local JVM policy tests                            | 0.5.2 | Confirmed | Remote-key mapping, default viewport behavior, and trusted-navigation policy pass locally. This is not a device test.                       |
| Android TV emulator / Android 16 (API 36), x86_64 | 0.5.2 | Confirmed | D-pad navigation, settings, subtitles, media keys, fullscreen, playback, and 1080p scaling were confirmed on 2026-08-13.                    |
| Android TV / Google TV hardware, API 23+          | 0.5.2 | Confirmed | Physical-TV testing confirmed the restored v0.5.0-scale layout and retained v0.5.1 features. Device-specific codecs and DRM can still vary. |

The minimum SDK is API 23. This is a packaging floor, not a claim that every device, WebView version, codec, media provider, or DRM configuration works.

## What to include in a compatibility report

- Full TV or streaming-device model, with serial number omitted
- Tizen or Android/software version shown by the device
- TizenBrew version or Android System WebView version, as applicable
- Module identifier or Android APK version
- Whether launch, arrows, OK, Back, media keys, source loading, and playback work
- Any reproducible lag or navigation edge case

Avoid publishing the TV's serial number, MAC address, local IP address, cookies, signed media URLs, or account details.
