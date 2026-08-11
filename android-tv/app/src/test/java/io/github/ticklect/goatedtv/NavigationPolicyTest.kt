package io.github.ticklect.goatedtv

import org.junit.Assert.assertEquals
import org.junit.Test

class NavigationPolicyTest {
    @Test
    fun loadsOnlySecureGoatedPagesInsideTheApp() {
        assertEquals(NavigationDecision.LOAD_IN_APP, NavigationPolicy.decide("https://goated.cx/"))
        assertEquals(
            NavigationDecision.LOAD_IN_APP,
            NavigationPolicy.decide("https://auth.goated.cx/callback?value=1"),
        )
    }

    @Test
    fun sendsOrdinaryWebLinksToAnExternalBrowser() {
        assertEquals(
            NavigationDecision.OPEN_EXTERNALLY,
            NavigationPolicy.decide("https://example.com/help"),
        )
    }

    @Test
    fun blocksMalformedAndNativeSchemeLinks() {
        assertEquals(NavigationDecision.BLOCK, NavigationPolicy.decide("javascript:alert(1)"))
        assertEquals(NavigationDecision.BLOCK, NavigationPolicy.decide("intent://example/#Intent;end"))
        assertEquals(NavigationDecision.BLOCK, NavigationPolicy.decide("http://goated.cx/insecure"))
        assertEquals(NavigationDecision.BLOCK, NavigationPolicy.decide("not a url"))
    }

    @Test
    fun doesNotAcceptLookalikeHosts() {
        assertEquals(
            NavigationDecision.OPEN_EXTERNALLY,
            NavigationPolicy.decide("https://goated.cx.example.com/"),
        )
    }
}
