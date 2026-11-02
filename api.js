// api.js - Jambatan API GitHub Pages ke Google Apps Script eSPeKS
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwsa_ccL8AYUbg0GqIbsNqmFOYdJY-BFngNN0Fdma7aVk9y8RhjeS4zRWEqP-Z4r2N2/exec";

function callAppsScript(actionName, params, successCallback, failureCallback) {
  fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: actionName, params: params })
  })
  .then(res => res.json())
  .then(res => {
    if (successCallback) successCallback(res);
  })
  .catch(err => {
    console.error("Ralat Sambungan API (" + actionName + "):", err);
    if (typeof showLoading === 'function') showLoading(false);
    if (failureCallback) {
      failureCallback(err);
    } else if (typeof Swal !== 'undefined') {
      Swal.fire('Ralat Sambungan', 'Gagal menghubungi pelayan data eSPeKS.', 'error');
    }
  });
}

// Pengganti automatik objek google.script.run untuk fail-fail HTML lama
window.google = window.google || {};
window.google.script = {
  run: new Proxy({}, {
    get: function(target, prop) {
      if (prop === 'withSuccessHandler') {
        return function(successCb) {
          return new Proxy({}, {
            get: function(t2, fnName) {
              if (fnName === 'withFailureHandler') {
                return function(failCb) {
                  return new Proxy({}, {
                    get: function(t3, finalFn) {
                      return function(...args) {
                        callAppsScript(finalFn, args.length === 1 ? args[0] : args, successCb, failCb);
                      };
                    }
                  });
                }
              }
              return function(...args) {
                callAppsScript(fnName, args.length === 1 ? args[0] : args, successCb, null);
              };
            }
          });
        };
      }
      return function(...args) {
        callAppsScript(prop, args.length === 1 ? args[0] : args, null, null);
      };
    }
  })
};
