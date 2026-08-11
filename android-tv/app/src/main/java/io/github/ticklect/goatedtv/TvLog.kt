package io.github.ticklect.goatedtv

import android.util.Log

internal object TvLog {
    private const val TAG = "GoatedAndroidTv"

    fun debug(message: String) {
        if (BuildConfig.DEBUG) Log.d(TAG, message)
    }

    fun warning(message: String, error: Throwable? = null) {
        if (BuildConfig.DEBUG) Log.w(TAG, message, error)
    }
}
