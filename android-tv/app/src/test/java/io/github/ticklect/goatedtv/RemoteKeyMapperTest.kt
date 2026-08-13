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
        assertEquals("Enter", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_BUTTON_SELECT)?.key)
        assertEquals(" ", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_SPACE)?.key)
        assertTrue(RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_DPAD_RIGHT)?.repeatable == true)
    }

    @Test
    fun mapsKeyboardGamepadAndContextKeys() {
        assertEquals("BrowserBack", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_ESCAPE)?.key)
        assertEquals("BrowserBack", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_BUTTON_B)?.key)
        assertEquals("ContextMenu", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_MENU)?.key)
        assertEquals("ContextMenu", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_BUTTON_START)?.key)
        assertEquals("ContextMenu", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_TV_CONTENTS_MENU)?.key)
        assertEquals("ContextMenu", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_TV_MEDIA_CONTEXT_MENU)?.key)
        assertEquals("Info", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_INFO)?.key)
        assertEquals("Captions", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_CAPTIONS)?.key)
    }

    @Test
    fun mapsBackAndMediaKeysToSharedTizenNames() {
        assertEquals(WebRemoteKey("BrowserBack", 10009), RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_BACK))
        assertEquals("MediaPlayPause", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE)?.key)
        assertEquals("MediaFastForward", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_MEDIA_FAST_FORWARD)?.key)
        assertEquals("MediaRewind", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_MEDIA_REWIND)?.key)
        assertEquals("MediaStop", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_MEDIA_STOP)?.key)
        assertEquals("MediaStop", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_MEDIA_CLOSE)?.key)
        assertEquals("MediaPlayPause", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_HEADSETHOOK)?.key)
        assertEquals("MediaFastForward", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_MEDIA_SKIP_FORWARD)?.key)
        assertEquals("MediaRewind", RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_MEDIA_STEP_BACKWARD)?.key)
    }

    @Test
    fun ignoresKeysThatAreNotPartOfTheTvContract() {
        assertNull(RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_VOLUME_UP))
        assertNull(RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_POWER))
        assertNull(RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_TV_INPUT))
        assertNull(RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_GUIDE))
        assertNull(RemoteKeyMapper.fromAndroidKeyCode(KeyEvent.KEYCODE_VOICE_ASSIST))
    }
}
