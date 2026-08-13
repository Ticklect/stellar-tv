(function installAndroidTvRemoteBridge() {
  'use strict';

  if (typeof window.__goatedAndroidTvDispatch === 'function') return;

  window.__goatedAndroidTvDispatch = function dispatchAndroidTvKey(key, keyCode) {
    var receivedAt =
      window.performance && typeof window.performance.now === 'function'
        ? window.performance.now()
        : Date.now();
    var event = new KeyboardEvent('keydown', {
      key: key,
      code: key,
      bubbles: true,
      cancelable: true
    });

    try {
      Object.defineProperty(event, 'keyCode', {
        get: function () {
          return keyCode;
        }
      });
      Object.defineProperty(event, 'which', {
        get: function () {
          return keyCode;
        }
      });
      Object.defineProperty(event, '__goatedTvBridgeAt', {
        value: receivedAt
      });
    } catch (_error) {
      // Modern WebViews already expose the key name used by the shared navigation code.
    }

    var target =
      document.activeElement && document.activeElement !== document.body
        ? document.activeElement
        : document;
    target.dispatchEvent(event);
    return event.defaultPrevented;
  };
})();
