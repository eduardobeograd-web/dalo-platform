const DALO_SERVICE_WORKER_VERSION = "dalo-pwa-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith("dalo-pwa-"))
            .filter((cacheName) => cacheName !== DALO_SERVICE_WORKER_VERSION)
            .map((cacheName) => caches.delete(cacheName))
        )
      ),
    ])
  );
});

// DALO intentionally does not cache checkout, account, QR-code, or order data.
self.addEventListener("fetch", () => {
  // Keep requests on the normal network path. The listener provides broad
  // installability support without caching private account or checkout data.
});
