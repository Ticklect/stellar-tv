package io.github.ticklect.goatedtv

import android.graphics.Bitmap
import android.view.View
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.widget.FrameLayout
import android.widget.ProgressBar

internal class TvWebChromeClient(
    private val fullscreenContainer: FrameLayout,
    private val progressBar: ProgressBar,
    private val onFullscreenChanged: (Boolean) -> Unit,
) : WebChromeClient() {
    private var customView: View? = null
    private var customViewCallback: CustomViewCallback? = null

    val isFullscreen: Boolean
        get() = customView != null

    override fun onProgressChanged(view: WebView?, newProgress: Int) {
        progressBar.progress = newProgress
        progressBar.visibility = if (newProgress in 0..99) View.VISIBLE else View.GONE
    }

    override fun getDefaultVideoPoster(): Bitmap? = super.getDefaultVideoPoster()

    override fun onShowCustomView(view: View, callback: CustomViewCallback) {
        if (customView != null) {
            callback.onCustomViewHidden()
            return
        }

        customView = view
        customViewCallback = callback
        fullscreenContainer.addView(
            view,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT,
            ),
        )
        fullscreenContainer.visibility = View.VISIBLE
        fullscreenContainer.bringToFront()
        onFullscreenChanged(true)
    }

    override fun onHideCustomView() {
        val view = customView ?: return
        fullscreenContainer.removeView(view)
        fullscreenContainer.visibility = View.GONE
        customView = null
        customViewCallback?.onCustomViewHidden()
        customViewCallback = null
        onFullscreenChanged(false)
    }

    override fun onPermissionRequest(request: PermissionRequest) {
        TvLog.warning("Web permission request denied")
        request.deny()
    }
}
