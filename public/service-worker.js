// ============================================================
// JobPriceNow — Service Worker
//
// Kept deliberately minimal. Two jobs:
//  1. Its presence (with a fetch handler) is what makes Chrome/Android
//     treat the site as installable in the first place.
//  2. Caches the core app shell so the calculator still loads if
//     someone opens it with a spotty or dropped connection — pricing
//     itself still needs a live network call, but the page won't be a
//     blank error screen while that request is in flight or retried.
//
// Bump CACHE_VERSION any time app.js/styles.css/index.html change in a
// way that matters offline — old caches are cleared automatically on
// activate, so visitors always get the latest shell on their next visit.
// ============================================================

const CACHE_VERSION = "jpn-shell-v1";
const APP_SHELL = ["/", "/index.html", "/app.js", "/styles.css", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Never cache API calls (estimates, quotes, admin, tracking) — those
  // always need a live network round trip, caching them would serve
  // stale prices or broken admin state.
  if (request.method !== "GET" || request.url.includes("/api/") || request.url.includes("/.netlify/")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      // Serve cached instantly if we have it (fast repeat loads), still
      // refresh the cache in the background from the network.
      return cached || networkFetch;
    })
  );
});
