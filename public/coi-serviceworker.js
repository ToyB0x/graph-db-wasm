/*! coi-serviceworker v0.1.7 - Guido Zuidhof, licensed under MIT */
/*
 * This service worker adds Cross-Origin-Opener-Policy and
 * Cross-Origin-Embedder-Policy headers to enable SharedArrayBuffer
 * on environments (like GitHub Pages) where server headers cannot be set.
 */
if (typeof window === "undefined") {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) =>
    event.waitUntil(self.clients.claim())
  );
  self.addEventListener("fetch", (event) => {
    if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") return;
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.status === 0) return response;
        const headers = new Headers(response.headers);
        headers.set("Cross-Origin-Embedder-Policy", "require-corp");
        headers.set("Cross-Origin-Opener-Policy", "same-origin");
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      })
    );
  });
} else {
  (() => {
    const reloadedByCOI = window.sessionStorage.getItem("coiReloadedByCOI");
    window.sessionStorage.removeItem("coiReloadedByCOI");
    const coepDegrading = reloadedByCOI === "true" && !window.crossOriginIsolated;
    if (window.crossOriginIsolated !== false || coepDegrading) return;
    const reg = window.navigator.serviceWorker;
    if (!reg) return;
    reg.register(new URL("coi-serviceworker.js", window.location.href).href).then(
      (registration) => {
        if (registration.active && !registration.installing && !registration.waiting) {
          window.sessionStorage.setItem("coiReloadedByCOI", "true");
          window.location.reload();
        } else if (registration.installing) {
          registration.installing.addEventListener("statechange", () => {
            if (registration.active && !registration.installing && !registration.waiting) {
              window.sessionStorage.setItem("coiReloadedByCOI", "true");
              window.location.reload();
            }
          });
        }
      }
    );
  })();
}
