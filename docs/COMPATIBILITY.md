# Compatibility

Statuses are evidence labels:

- **Confirmed** — tested directly for this project with the listed result.
- **Reported** — a user report exists, but the maintainers have not reproduced it.
- **Untested** — no project-specific result is available.

| Device / Tizen version                              | TizenBrew version | Status    | Notes                                                                                                             |
| --------------------------------------------------- | ----------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| Samsung UE50U8000…KXXU / Tizen version not recorded | 2.0.5             | Confirmed | Remote navigation, title selection, source loading, and video playback confirmed with module 0.4.1 on 2026-08-11. |
| Other Samsung/Tizen configurations                  | Other versions    | Untested  | Do not infer support from the confirmed device. Reports are welcome.                                              |

## What to include in a compatibility report

- Full TV model code, with serial number omitted
- Tizen/software version shown by the TV
- TizenBrew version
- Module version or exact GitHub identifier
- Whether launch, arrows, OK, Back, media keys, source loading, and playback work
- Any reproducible lag or navigation edge case

Avoid publishing the TV's serial number, MAC address, local IP address, cookies, signed media URLs, or account details.
