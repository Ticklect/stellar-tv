# Goated TizenBrew application module

This is a TizenBrew site-modification module for `https://goated.cx/`.

The module adds Netflix-style spatial navigation for Goated's header, horizontal content rails, popups, title details, search controls, and video player. It includes a strong visible focus ring, OK/Enter activation, modal-aware Back behavior, Play/Pause, Stop, and 15-second seek controls. Focus is restored to the originating poster after dialogs close, and search navigation moves between the query field and the primary result action.

On Samsung TVs, it also moves Goated's source-discovery proof of work into optimized background workers. This prevents the resolver from starving the interface and helps it finish before Goated's 15-second source timeout. Cached focus maps, direct rail-to-rail movement, lazy offscreen images, reduced blur, and instant scrolling lower home-screen rendering cost.

To install through TizenBrew's module manager, the package must be published as an npm package or placed in a GitHub repository that TizenBrew can fetch.

When updating, use the versioned GitHub module name provided with the release. Its new module identity bypasses TizenBrew 2.0.5's in-memory script cache.
