# Goated TizenBrew application module

This is a TizenBrew site-modification module for `https://goated.cx/`.

The module adds Netflix-style spatial navigation for Goated's header, horizontal content rails, popups, title details, search controls, and video player. It includes a strong visible focus ring, OK/Enter activation, modal-aware Back behavior, Play/Pause, Stop, and 15-second seek controls. Playback still depends on the website's video sources being compatible with the Samsung TV browser.

To install through TizenBrew's module manager, the package must be published as an npm package or placed in a GitHub repository that TizenBrew can fetch.

When updating this GitHub module, fully restart TizenBrew after removing the old version. TizenBrew 2.0.5 caches injected module scripts for the lifetime of its background service, so reinstalling without a restart can continue running the previous code.
