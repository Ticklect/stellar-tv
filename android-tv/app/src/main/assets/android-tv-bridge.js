(function installAndroidTvRemoteBridge() {
  'use strict';

  if (typeof window.__goatedAndroidTvDispatch === 'function') return;

  window.__goatedAndroidTvDispatch = function dispatchAndroidTvKey(key, keyCode) {
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
    } catch (_error) {
      // Modern WebViews already expose the key name used by the shared navigation code.
    }

    document.dispatchEvent(event);
    return event.defaultPrevented;
  };
})();
