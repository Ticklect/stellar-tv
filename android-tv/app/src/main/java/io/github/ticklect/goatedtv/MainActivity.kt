package io.github.ticklect.goatedtv

import android.annotation.SuppressLint
import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.webkit.CookieManager
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.window.OnBackInvokedDispatcher

class MainActivity : Activity() {
    private lateinit var webContainer: FrameLayout
    private lateinit var fullscreenContainer: FrameLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var errorPanel: LinearLayout
    private lateinit var errorMessage: TextView
    private lateinit var retryButton: Button
    private lateinit var chromeClient: TvWebChromeClient
    private var webView: WebView? = null
    private var scriptsReady = false
    private var injectionInProgress = false
    private var injectedPageUrl: String? = null
    private var savedWebState: Bundle? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webContainer = findViewById(R.id.web_container)
        fullscreenContainer = findViewById(R.id.fullscreen_container)
        progressBar = findViewById(R.id.loading)
        errorPanel = findViewById(R.id.error_panel)
        errorMessage = findViewById(R.id.error_message)
        retryButton = findViewById(R.id.retry_button)

        retryButton.setOnClickListener {
            hideError()
            webView?.reload() ?: createWebView(savedInstanceState)
        }

        enterImmersiveMode()
        createWebView(savedInstanceState)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            onBackInvokedDispatcher.registerOnBackInvokedCallback(
                OnBackInvokedDispatcher.PRIORITY_DEFAULT,
            ) {
                TvLog.debug("System Back callback")
                handleBackKey(WebRemoteKey("BrowserBack", 10009))
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun createWebView(state: Bundle?) {
        val browser = WebView(this)
        webView = browser
        scriptsReady = false
        webContainer.removeAllViews()
        webContainer.addView(
            browser,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT,
            ),
        )

        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
        browser.setBackgroundColor(Color.BLACK)
        browser.isFocusable = true
        browser.isFocusableInTouchMode = true

        browser.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            textZoom = 100
            builtInZoomControls = false
            displayZoomControls = false
            allowFileAccess = false
            allowContentAccess = false
            @Suppress("DEPRECATION")
            allowFileAccessFromFileURLs = false
            @Suppress("DEPRECATION")
            allowUniversalAccessFromFileURLs = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            setSupportMultipleWindows(false)
            javaScriptCanOpenWindowsAutomatically = false
            setGeolocationEnabled(false)
            userAgentString = "$userAgentString GoatedAndroidTV/${BuildConfig.VERSION_NAME}"
        }
        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(browser, false)
        }

        chromeClient = TvWebChromeClient(fullscreenContainer, progressBar) { isFullscreen ->
            if (isFullscreen) {
                window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            } else {
                window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            }
            enterImmersiveMode()
        }
        browser.webChromeClient = chromeClient
        browser.webViewClient = TvWebViewClient(
            openExternal = ::openExternal,
            onTrustedPageStarted = {
                scriptsReady = false
                injectionInProgress = false
                injectedPageUrl = null
                hideError()
            },
            onTrustedPageReady = { readyBrowser ->
                progressBar.visibility = View.GONE
                injectCompatibilityScripts(readyBrowser)
            },
            onMainFrameError = ::showError,
            onRenderProcessGone = {
                savedWebState = null
                webContainer.removeView(browser)
                browser.destroy()
                createWebView(null)
            },
        )

        val restoreState = state ?: savedWebState
        val restored = restoreState != null && browser.restoreState(restoreState) != null
        if (!restored) browser.loadUrl(HOME_URL)
        browser.requestFocus()
    }

    private fun injectCompatibilityScripts(browser: WebView) {
        val pageUrl = browser.url ?: return
        if (scriptsReady || injectionInProgress || injectedPageUrl == pageUrl) return
        injectionInProgress = true
        injectedPageUrl = pageUrl
        val navigationScript = readAsset("tv-navigation.js")
        val bridgeScript = readAsset("android-tv-bridge.js")
        browser.evaluateJavascript(navigationScript) {
            browser.evaluateJavascript(bridgeScript) {
                injectionInProgress = false
                if (browser.url == pageUrl &&
                    NavigationPolicy.decide(pageUrl) == NavigationDecision.LOAD_IN_APP
                ) {
                    scriptsReady = true
                    TvLog.debug("TV navigation compatibility layer ready")
                }
            }
        }
    }

    private fun readAsset(name: String): String =
        assets.open(name).bufferedReader(Charsets.UTF_8).use { it.readText() }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        val remoteKey = RemoteKeyMapper.fromAndroidKeyCode(event.keyCode)
            ?: return super.dispatchKeyEvent(event)
        if (event.keyCode == KeyEvent.KEYCODE_BACK && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return super.dispatchKeyEvent(event)
        }
        TvLog.debug(
            "Remote key ${remoteKey.key}, action=${event.action}, repeat=${event.repeatCount}, ready=$scriptsReady",
        )
        if (event.action == KeyEvent.ACTION_UP) {
            return if (scriptsReady || remoteKey.key == "BrowserBack") true else super.dispatchKeyEvent(event)
        }
        if (event.action != KeyEvent.ACTION_DOWN) return super.dispatchKeyEvent(event)

        if (event.repeatCount > 0 && !remoteKey.repeatable) return true
        if (remoteKey.key == "BrowserBack") {
            handleBackKey(remoteKey)
            return true
        }
        if (!scriptsReady) return super.dispatchKeyEvent(event)

        val fallbackEvent = KeyEvent(event)
        dispatchRemoteKey(remoteKey) { handled ->
            if (!handled) dispatchUnhandledKeyToWebView(fallbackEvent)
        }
        return true
    }

    private fun dispatchUnhandledKeyToWebView(event: KeyEvent) {
        val browser = webView ?: return
        TvLog.debug("Web key was not handled; forwarding ${event.keyCode} to WebView")
        browser.dispatchKeyEvent(event)
        if (event.action == KeyEvent.ACTION_DOWN) {
            browser.dispatchKeyEvent(KeyEvent.changeAction(event, KeyEvent.ACTION_UP))
        }
    }

    private fun handleBackKey(remoteKey: WebRemoteKey) {
        if (::chromeClient.isInitialized && chromeClient.isFullscreen) {
            chromeClient.onHideCustomView()
            return
        }

        if (!scriptsReady) {
            val browser = webView
            val currentUrl = browser?.url
            if (browser != null &&
                currentUrl != null &&
                NavigationPolicy.decide(currentUrl) == NavigationDecision.LOAD_IN_APP
            ) {
                injectCompatibilityScripts(browser)
                return
            }
            navigateBackOrFinish()
            return
        }
        dispatchRemoteKey(remoteKey) { handled ->
            TvLog.debug("Web Back handled=$handled")
            if (!handled) navigateBackOrFinish()
        }
    }

    @Deprecated("Used as the Back fallback on Android 12 and earlier")
    @SuppressLint("GestureBackNavigation")
    override fun onBackPressed() {
        TvLog.debug("Legacy system Back callback")
        handleBackKey(WebRemoteKey("BrowserBack", 10009))
    }

    private fun dispatchRemoteKey(remoteKey: WebRemoteKey, result: ((Boolean) -> Unit)? = null) {
        val script = "window.__goatedAndroidTvDispatch?.(" +
            "${jsString(remoteKey.key)},${remoteKey.keyCode}) === true"
        webView?.evaluateJavascript(script) { value ->
            if (result != null) TvLog.debug("Web key result=$value")
            result?.invoke(value == "true")
        }
            ?: result?.invoke(false)
    }

    private fun jsString(value: String): String = buildString {
        append('"')
        value.forEach { character ->
            when (character) {
                '\\' -> append("\\\\")
                '"' -> append("\\\"")
                '\n' -> append("\\n")
                '\r' -> append("\\r")
                else -> append(character)
            }
        }
        append('"')
    }

    private fun navigateBackOrFinish() {
        val browser = webView
        if (browser?.canGoBack() == true) browser.goBack() else finishAfterTransition()
    }

    private fun openExternal(uri: Uri) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, uri).apply {
                addCategory(Intent.CATEGORY_BROWSABLE)
            })
        } catch (error: ActivityNotFoundException) {
            TvLog.warning("No application can open an external HTTPS link", error)
        }
    }

    private fun showError(message: String) {
        scriptsReady = false
        progressBar.visibility = View.GONE
        errorMessage.text = message.ifBlank { getString(R.string.error_message) }
        errorPanel.visibility = View.VISIBLE
        errorPanel.bringToFront()
        retryButton.requestFocus()
    }

    private fun hideError() {
        errorPanel.visibility = View.GONE
    }

    private fun enterImmersiveMode() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.insetsController?.apply {
                hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
                systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility =
                View.SYSTEM_UI_FLAG_FULLSCREEN or
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) enterImmersiveMode()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        webView?.saveState(outState)
        super.onSaveInstanceState(outState)
    }

    override fun onPause() {
        webView?.onPause()
        super.onPause()
    }

    override fun onResume() {
        super.onResume()
        webView?.onResume()
    }

    override fun onDestroy() {
        webView?.apply {
            stopLoading()
            webChromeClient = null
            webViewClient = WebViewClient()
            destroy()
        }
        webView = null
        super.onDestroy()
    }

    private companion object {
        const val HOME_URL = "https://goated.cx/"
    }
}
