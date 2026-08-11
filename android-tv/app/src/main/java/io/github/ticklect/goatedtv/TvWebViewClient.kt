package io.github.ticklect.goatedtv

import android.graphics.Bitmap
import android.net.Uri
import android.net.http.SslError
import android.webkit.RenderProcessGoneDetail
import android.webkit.SslErrorHandler
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient

internal class TvWebViewClient(
    private val openExternal: (Uri) -> Unit,
    private val onTrustedPageStarted: () -> Unit,
    private val onTrustedPageReady: (WebView) -> Unit,
    private val onMainFrameError: (String) -> Unit,
    private val onRenderProcessGone: () -> Unit,
) : WebViewClient() {
    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean =
        handleNavigation(request.url)

    private fun handleNavigation(uri: Uri): Boolean = when (NavigationPolicy.decide(uri.toString())) {
        NavigationDecision.LOAD_IN_APP -> false
        NavigationDecision.OPEN_EXTERNALLY -> {
            openExternal(uri)
            true
        }
        NavigationDecision.BLOCK -> {
            TvLog.warning("Blocked navigation to an unsupported URL scheme")
            true
        }
    }

    override fun onPageStarted(view: WebView, url: String?, favicon: Bitmap?) {
        if (url != null && NavigationPolicy.decide(url) == NavigationDecision.LOAD_IN_APP) {
            onTrustedPageStarted()
        }
    }

    override fun onPageFinished(view: WebView, url: String?) {
        if (url != null && NavigationPolicy.decide(url) == NavigationDecision.LOAD_IN_APP) {
            onTrustedPageReady(view)
        }
    }

    override fun onPageCommitVisible(view: WebView, url: String?) {
        if (url != null && NavigationPolicy.decide(url) == NavigationDecision.LOAD_IN_APP) {
            onTrustedPageReady(view)
        }
    }

    override fun onReceivedError(
        view: WebView,
        request: WebResourceRequest,
        error: WebResourceError,
    ) {
        if (request.isForMainFrame) {
            onMainFrameError(error.description?.toString().orEmpty())
        }
    }

    override fun onReceivedSslError(view: WebView, handler: SslErrorHandler, error: SslError) {
        handler.cancel()
        onMainFrameError(view.context.getString(R.string.error_ssl))
    }

    override fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean {
        TvLog.warning("WebView renderer exited; recreating the page")
        onRenderProcessGone()
        return true
    }
}
