package io.github.ticklect.goatedtv

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class TvViewportTest {
    @Test
    fun selectsStableTvLayoutWidthsForStandardResolutions() {
        assertEquals(1280, TvViewport.layoutWidth(1280))
        assertEquals(1920, TvViewport.layoutWidth(1920))
        assertEquals(1920, TvViewport.layoutWidth(3840))
    }

    @Test
    fun calculatesScaleFromPhysicalWidthDensityAndLogicalTvWidth() {
        assertEquals(79, TvViewport.initialScalePercent(1280, 2f))
        assertEquals(79, TvViewport.initialScalePercent(1920, 2f))
        assertEquals(100, TvViewport.initialScalePercent(3840, 2f))
        assertTrue(TvViewport.initialScalePercent(1920, 0f) in 25..100)
    }
}
