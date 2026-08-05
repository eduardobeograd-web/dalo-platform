const DALO_SERVICE_WORKER_VERSION = "dalo-pwa-v3";

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

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "New DALO support request", {
      body: payload.body || "A customer needs support.",
      icon: "/pwa-icon-192.png",
      badge: "/pwa-icon-192.png",
      tag: payload.tag || "dalo-support",
      renotify: true,
      data: { url: payload.url || "/support-console" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/support-console", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clients) => {
      for (const client of clients) {
        if ("navigate" in client) await client.navigate(targetUrl);
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
