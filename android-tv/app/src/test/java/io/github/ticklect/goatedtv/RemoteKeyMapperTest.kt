package io.github.ticklect.goatedtv

import android.view.KeyEvent
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class RemoteKeyMapperTest {
    @Test
    fun mapsDirectionalAndSelectKeys() {
        assertEquals("ArrowUp", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_DPAD_UP)?.key)
        assertEquals("ArrowDown", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_DPAD_DOWN)?.key)
        assertEquals("ArrowLeft", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_DPAD_LEFT)?.key)
        assertEquals("ArrowRight", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_DPAD_RIGHT)?.key)
        assertEquals("Enter", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_DPAD_CENTER)?.key)
        assertTrue(RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_DPAD_RIGHT)?.repeatable == true)
    }

    @Test
    fun mapsBackAndMediaKeysToSharedTizenNames() {
        assertEquals(WebRemoteKey("BrowserBack", 10009), RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_BACK))
        assertEquals("MediaPlayPause", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE)?.key)
        assertEquals("MediaFastForward", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_MEDIA_FAST_FORWARD)?.key)
        assertEquals("MediaRewind", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_MEDIA_REWIND)?.key)
        assertEquals("MediaStop", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_MEDIA_STOP)?.key)
    }

    @Test
    fun ignoresKeysThatAreNotPartOfTheTvContract() {
        assertNull(RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_VOLUME_UP))
    }
}
