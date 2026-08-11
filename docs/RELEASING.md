# Releasing

The project uses Semantic Versioning. While the project is below `1.0.0`, increment:

- Patch for compatible fixes, documentation, tests, and maintenance
- Minor for meaningful new behavior or intentional compatibility changes
- Major when a stable public contract is declared and later broken

## Release checklist

1. Choose the version and update `package.json` and `main.js`'s diagnostic `MODULE_VERSION` together.
2. Move relevant entries from `Unreleased` to a dated changelog heading.
3. Run `npm ci` and `npm run validate` from a clean checkout.
4. Test launch, arrows, OK, Back, search, media keys, source loading, and playback on at least one documented TV configuration.
5. Inspect `npm pack --dry-run` and confirm no secrets, logs, caches, or unrelated assets are included.
6. Commit the release preparation.
7. Create an annotated `v<version>` tag only after review.
8. Create a GitHub Release from that tag with notes derived from the changelog.
9. Verify the pinned GitHub identifier in TizenBrew.

Do not move or recreate an existing public tag. Do not publish an npm package until ownership, provenance, and the official package name are deliberately established.

## Next release

The first proper GitHub Release should be `v0.4.1`. It is a patch release over the working `v0.4.0` tag: runtime behavior remains compatible, while diagnostics, testability, licensing, and repository infrastructure improve. The existing tags should remain intact and can be referenced by the changelog even though no GitHub Release objects currently exist.
