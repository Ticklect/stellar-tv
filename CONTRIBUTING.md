# Contributing

Thanks for helping make Goated for TizenBrew more reliable. Small, tested contributions are especially welcome.

## Report a bug

Use the bug-report issue form. Search existing issues first, then include the TV model, Tizen version if known, TizenBrew version, module version, exact reproduction steps, expected and actual behavior, and redacted logs or screenshots. Never post credentials, cookies, signed media URLs, private network details, or source challenge data.

Security vulnerabilities must follow [SECURITY.md](SECURITY.md), not the public bug tracker.

## Suggest a feature

Use the feature-request form. Describe the user problem, desired behavior, alternatives considered, and why the idea belongs in this module rather than the target website or TizenBrew itself.

## Make a change

1. Fork the repository and clone your fork.
2. Create a focused branch such as `fix/player-back-button`, `feature/remote-key`, `docs/installation`, or `test/spatial-navigation`.
3. Install development dependencies with `npm ci`.
4. Make the smallest coherent change. Preserve compatibility with the TV browser and avoid unnecessary runtime dependencies.
5. Add or update meaningful tests for deterministic behavior.
6. Run `npm run validate`.
7. Commit with a short imperative subject, for example `Fix focus restoration after dialog close`.
8. Open a pull request using the template and link related issues.

## Code quality

- Keep `main.js` understandable in older TV-browser environments; do not introduce unsupported syntax without compatibility evidence.
- Prefer pure, testable helpers for geometry, key mapping, and state calculations.
- Explain non-obvious Samsung/Tizen behavior near the relevant code.
- Keep production logging limited to actionable failures and never log secrets or complete signed URLs.
- Do not add generated bundles, caches, editor state, device logs, or `.env` files.
- Do not add copied scripts, artwork, logos, fonts, or libraries unless their provenance and license are documented and compatible.
- Do not claim device support without reporting the exact tested configuration.

By contributing, you agree that your contribution is licensed under `LGPL-3.0-only` and that you have the right to submit it.
