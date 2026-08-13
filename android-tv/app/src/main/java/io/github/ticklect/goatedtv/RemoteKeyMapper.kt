package io.github.ticklect.goatedtv

import android.view.KeyEvent

internal data class WebRemoteKey(
    val key: String,
    val keyCode: Int,
    val repeatable: Boolean = false,
)

internal object RemoteKeyMapper {
    fun fromAndroidKeyCode(keyCode: Int): WebRemoteKey? = when (keyCode) {
        KeyEvent.KEYCODE_DPAD_UP -> WebRemoteKey("ArrowUp", 38, repeatable = true)
        KeyEvent.KEYCODE_DPAD_DOWN -> WebRemoteKey("ArrowDown", 40, repeatable = true)
        KeyEvent.KEYCODE_DPAD_LEFT -> WebRemoteKey("ArrowLeft", 37, repeatable = true)
        KeyEvent.KEYCODE_DPAD_RIGHT -> WebRemoteKey("ArrowRight", 39, repeatable = true)
        KeyEvent.KEYCODE_DPAD_CENTER,
        KeyEvent.KEYCODE_ENTER,
        KeyEvent.KEYCODE_NUMPAD_ENTER,
        KeyEvent.KEYCODE_BUTTON_A,
        KeyEvent.KEYCODE_BUTTON_SELECT,
        -> WebRemoteKey("Enter", 13)
        KeyEvent.KEYCODE_SPACE -> WebRemoteKey(" ", 32)
        KeyEvent.KEYCODE_BACK,
        KeyEvent.KEYCODE_ESCAPE,
        KeyEvent.KEYCODE_BUTTON_B,
        -> WebRemoteKey("BrowserBack", 10009)
        KeyEvent.KEYCODE_MENU,
        KeyEvent.KEYCODE_BUTTON_START,
        KeyEvent.KEYCODE_TV_CONTENTS_MENU,
        KeyEvent.KEYCODE_TV_MEDIA_CONTEXT_MENU,
        -> WebRemoteKey("ContextMenu", 93)
        KeyEvent.KEYCODE_INFO -> WebRemoteKey("Info", 457)
        KeyEvent.KEYCODE_CAPTIONS -> WebRemoteKey("Captions", 175)
        KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> WebRemoteKey("MediaPlayPause", 10252)
        KeyEvent.KEYCODE_HEADSETHOOK -> WebRemoteKey("MediaPlayPause", 10252)
        KeyEvent.KEYCODE_MEDIA_PLAY -> WebRemoteKey("MediaPlay", 415)
        KeyEvent.KEYCODE_MEDIA_PAUSE -> WebRemoteKey("MediaPause", 19)
        KeyEvent.KEYCODE_MEDIA_STOP,
        KeyEvent.KEYCODE_MEDIA_CLOSE,
        -> WebRemoteKey("MediaStop", 413)
        KeyEvent.KEYCODE_MEDIA_FAST_FORWARD,
        KeyEvent.KEYCODE_MEDIA_SKIP_FORWARD,
        KeyEvent.KEYCODE_MEDIA_STEP_FORWARD,
        -> WebRemoteKey("MediaFastForward", 417, repeatable = true)
        KeyEvent.KEYCODE_MEDIA_REWIND,
        KeyEvent.KEYCODE_MEDIA_SKIP_BACKWARD,
        KeyEvent.KEYCODE_MEDIA_STEP_BACKWARD,
        -> WebRemoteKey("MediaRewind", 412, repeatable = true)
        KeyEvent.KEYCODE_MEDIA_NEXT -> WebRemoteKey("MediaTrackNext", 10233)
        KeyEvent.KEYCODE_MEDIA_PREVIOUS -> WebRemoteKey("MediaTrackPrevious", 10232)
        else -> null
    }
}
