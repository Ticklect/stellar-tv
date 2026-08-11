# Third-party notices and review notes

## Runtime code and assets

This repository does not bundle Goated's website code, media, logos, images, fonts, or other promotional assets. `main.js` is an independently written interoperability layer that runs against a separately hosted website.

The SHA-256 round constants and algorithm in `main.js` implement a published cryptographic standard. No external cryptography library is bundled.

## External systems

The module interoperates with systems that are not part of this project:

- Goated (`goated.cx`), including its DOM structure and player
- A source-resolution API currently hosted at `api.reallyfast.xyz`
- Media providers and hosts selected by the target website
- TizenBrew, Samsung Tizen, and Samsung TV browser APIs

Their availability, terms, trademarks, content rights, and privacy practices are controlled by their respective operators. The `LGPL-3.0-only` license applies only to original material in this repository and does not grant rights to those systems or their content.

Before a public release, maintainers should manually review whether use of the Goated name and automated interaction with its source-resolution API complies with applicable service terms and local law. No service terms or explicit trademark permission were found in this repository.

## Development dependencies

ESLint and Prettier are development-only dependencies and are not bundled into the TizenBrew module. Their license data is recorded in `package-lock.json` and should be reviewed when dependency versions change.
