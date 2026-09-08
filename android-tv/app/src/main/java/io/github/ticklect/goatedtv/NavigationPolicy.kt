package io.github.ticklect.goatedtv

import java.net.URI
import java.util.Locale

internal enum class NavigationDecision {
    LOAD_IN_APP,
    OPEN_EXTERNALLY,
    BLOCK,
}

internal object NavigationPolicy {
    private const val APP_HOST = "stellar.gdn"

    fun decide(rawUrl: String): NavigationDecision {
        val uri = runCatching { URI(rawUrl) }.getOrNull() ?: return NavigationDecision.BLOCK
        val scheme = uri.scheme?.lowercase(Locale.US) ?: return NavigationDecision.BLOCK
        val host = uri.host?.lowercase(Locale.US)

        if (scheme == "https" && (host == APP_HOST || host?.endsWith(".$APP_HOST") == true)) {
            return NavigationDecision.LOAD_IN_APP
        }

        return if (scheme == "https") {
            NavigationDecision.OPEN_EXTERNALLY
        } else {
            NavigationDecision.BLOCK
        }
    }
}
