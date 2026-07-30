const DALO_SERVICE_WORKER_VERSION = "dalo-pwa-v1";

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
