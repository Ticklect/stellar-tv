package io.github.ticklect.goatedtv

import kotlin.math.sqrt

internal object TvViewport {
    /** Keep TV breakpoints active while fitting the full desktop layout on high-density panels. */
    fun layoutWidth(screenWidthPixels: Int): Int = screenWidthPixels.coerceIn(1280, 1920)

    fun initialScalePercent(screenWidthPixels: Int, density: Float): Int {
        val safeDensity = density.takeIf { it > 0f } ?: 1f
        return (112f * sqrt(screenWidthPixels / (safeDensity * layoutWidth(screenWidthPixels))))
            .toInt()
            .coerceIn(25, 100)
    }
}
