# Third-party notices and review notes

## Runtime code and assets

This repository does not bundle Goated's website code, media, logos, images, fonts, or other promotional assets. `main.js` and the Android TV host are independently written interoperability layers that run against a separately hosted website.

The SHA-256 round constants and algorithm in `main.js` implement a published cryptographic standard. No external cryptography library is bundled.

## External systems

The module interoperates with systems that are not part of this project:

- Goated (`stellar.gdn`), including its DOM structure and player
- A source-resolution API currently hosted at `api.reallyfast.xyz`
- Media providers and hosts selected by the target website
- TizenBrew, Samsung Tizen, and Samsung TV browser APIs
- Android, Android TV, Google TV, Android System WebView, and Android SDK/Gradle tooling

Their availability, terms, trademarks, content rights, and privacy practices are controlled by their respective operators. The `LGPL-3.0-only` license applies only to original material in this repository and does not grant rights to those systems or their content.

Before a public release, maintainers should manually review whether use of the Goated name and automated interaction with its source-resolution API complies with applicable service terms and local law. No service terms or explicit trademark permission were found in this repository.

## Development dependencies

ESLint, Prettier, Gradle, the Android Gradle Plugin, JUnit, and Android SDK tooling are development/test dependencies and are not bundled as website content. Java/Kotlin runtime code in the APK uses Android platform APIs; dependency and license data should be reviewed whenever build dependencies change.
