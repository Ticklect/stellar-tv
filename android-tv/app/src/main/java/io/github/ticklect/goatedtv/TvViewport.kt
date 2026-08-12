package io.github.ticklect.goatedtv

import kotlin.math.sqrt

internal object TvViewport {
    /**
     * Android TV emulators commonly expose a phone-like 960 CSS-pixel viewport at 1080p.
     * Use the physical width up to a 1080p logical ceiling so TV breakpoints stay active
     * while 4K devices retain readable 1080p-sized controls.
     */
    fun layoutWidth(screenWidthPixels: Int): Int = screenWidthPixels.coerceIn(1280, 1920)

    fun initialScalePercent(screenWidthPixels: Int, density: Float): Int {
        val safeDensity = density.takeIf { it > 0f } ?: 1f
        return (112f * sqrt(screenWidthPixels / (safeDensity * layoutWidth(screenWidthPixels))))
            .toInt()
            .coerceIn(25, 100)
    }
}
