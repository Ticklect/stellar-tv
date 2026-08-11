# Android TV build

This directory contains the native Android TV / Google TV host. It opens the real `https://goated.cx/` site in a fullscreen WebView and adapts Android D-pad and media keys to the repository's existing TV-navigation contract.

It does not contain a copy of the target site or media. The root Tizen/TizenBrew package remains independent and unchanged in structure.

## Build

Install JDK 17 or newer plus Android SDK Platform 36 and Build Tools 36.0.0. Set `ANDROID_HOME`, `ANDROID_SDK_ROOT`, or create an untracked `local.properties` containing `sdk.dir=<path>`.

```sh
./gradlew testDebugUnitTest lintDebug assembleDebug
```

On Windows, use `gradlew.bat`. The debug APK is written to `app/build/outputs/apk/debug/app-debug.apk`.

## Install on an Android TV or Google TV

The exact setting names vary by manufacturer. Keep the TV and computer on the same local network when using wireless ADB.

### 1. Enable developer options

1. Open the TV's **Settings**.
2. Open **System > About** on Google TV, or **Device Preferences > About** on many Android TV devices.
3. Highlight **Android TV OS build** or **Build**, then press OK seven times.
4. Return to Settings and open **Developer options**.

### 2. Enable debugging and connect ADB

For devices with **Wireless debugging**:

1. Enable **Wireless debugging** on the TV.
2. Choose **Pair device with pairing code** and note the IP address, pairing port, and code.
3. On the computer, run:

   ```sh
   adb pair TV_IP_ADDRESS:PAIRING_PORT
   adb connect TV_IP_ADDRESS:DEBUGGING_PORT
   adb devices
   ```

4. Enter the pairing code when requested. The final `adb devices` output should show the TV as `device`, not `offline` or `unauthorized`.

For older devices, enable **USB debugging** or **Network debugging**, approve the computer on the TV, and use either USB or:

```sh
adb connect TV_IP_ADDRESS:5555
adb devices
```

Port `5555` is not universal. Use the address and port shown by the TV or follow the device manufacturer's debugging instructions.

### 3. Build and install

From this `android-tv` directory, build the debug APK:

```sh
./gradlew testDebugUnitTest lintDebug assembleDebug
```

On Windows, run `gradlew.bat testDebugUnitTest lintDebug assembleDebug` instead. Install or update the APK without clearing its saved session:

```sh
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

The TV may display an installation confirmation. After installation, open **Goated TV (Unofficial)** from the TV's Apps screen. A debug build can also be launched from ADB with:

```sh
adb shell monkey -p io.github.ticklect.goatedtv.debug -c android.intent.category.LEANBACK_LAUNCHER 1
```

### 4. Test the remote

Confirm that:

- Up, Down, Left, and Right move the visible focus outline.
- OK/Select opens the focused item.
- Back closes an open dialog or returns to the previous page before leaving the app.
- Play/Pause, Rewind, and Fast Forward work after a video starts.
- Fullscreen video opens and exits correctly.

### Troubleshooting

- If the TV is `unauthorized`, accept the debugging prompt on the TV and run `adb devices` again.
- If it is `offline`, run `adb disconnect`, reconnect using the TV's current address, and confirm that both devices are still on the same network.
- If pairing fails, turn Wireless debugging off and on to obtain fresh pairing and debugging ports; they can change.
- If the app opens a blank or old-looking page, update **Android System WebView** and the TV firmware, then restart the app.
- If `adb install` reports a signature mismatch, uninstall the differently signed development copy first. Uninstalling removes the app's saved session.

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
