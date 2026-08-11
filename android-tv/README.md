# Android TV build

This directory contains the native Android TV / Google TV host. It opens the real `https://goated.cx/` site in a fullscreen WebView and adapts Android D-pad and media keys to the repository's existing TV-navigation contract.

It does not contain a copy of the target site or media. The root Tizen/TizenBrew package remains independent and unchanged in structure.

## Build

Install JDK 17 or newer plus Android SDK Platform 36 and Build Tools 36.0.0. Set `ANDROID_HOME`, `ANDROID_SDK_ROOT`, or create an untracked `local.properties` containing `sdk.dir=<path>`.

```sh
./gradlew testDebugUnitTest lintDebug assembleDebug
```

On Windows, use `gradlew.bat`. The debug APK is written to `app/build/outputs/apk/debug/app-debug.apk`.

## Sideload

After enabling developer options and debugging on the TV and approving the computer:

```sh
adb connect TV_IP_ADDRESS:5555
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Some devices use USB debugging, Wireless debugging pairing, or a vendor-specific port instead. Follow the device manufacturer's instructions and do not assume port `5555` is enabled.

## Release signing

An unsigned release APK can be produced with `./gradlew assembleRelease`. For an intentionally signed build, set all four environment variables before running Gradle:

- `GOATED_ANDROID_KEYSTORE`: absolute path to the keystore
- `GOATED_ANDROID_STORE_PASSWORD`: keystore password
- `GOATED_ANDROID_KEY_ALIAS`: signing-key alias
- `GOATED_ANDROID_KEY_PASSWORD`: signing-key password

Never commit the keystore or any password. CI should provide these values through repository secrets only for an intentional release-signing run.

The tag-artifact workflow expects the keystore itself as a base64-encoded `GOATED_ANDROID_KEYSTORE_BASE64` GitHub secret, plus secrets matching the three password/alias variable names above. It decodes the file only into the temporary runner directory.

## Security model

- HTTPS-only navigation for Goated pages; ordinary external web links leave the app.
- TLS errors are cancelled, never bypassed.
- File/content access, universal file URL access, geolocation, WebView permission requests, mixed content, and JavaScript-opened windows are disabled.
- No `addJavascriptInterface` bridge is exposed to web content.
- Cookies and DOM storage remain available for normal site sessions; third-party cookies are disabled.
- WebView debugging and app logs are enabled only in debug builds.

The generic icon and TV banner are placeholders and should be replaced with reviewed, independently owned artwork before public distribution.
