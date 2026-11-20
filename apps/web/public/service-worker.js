const CACHE_NAME = "four-d-shell-v9";
const OFFLINE_ASSETS = ["/manifest.webmanifest", "/icons/4d-icon-192.png", "/icons/4d-icon-512.png"];
const CACHEABLE_PATHS = ["/assets/", "/brand/", "/icons/"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

function cacheResponse(request, response) {
  if (!response.ok) return;
  let cachedResponse;
  try {
    cachedResponse = response.clone();
  } catch {
    return;
  }
  void caches.open(CACHE_NAME).then((cache) => cache.put(request, cachedResponse)).catch(() => undefined);
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((response) => {
          cacheResponse("/", response);
          return response;
        })
        .catch(() => caches.match("/").then((cached) => cached || Response.error()))
    );
    return;
  }

  const isCacheableAsset = CACHEABLE_PATHS.some((prefix) => url.pathname.startsWith(prefix))
    || url.pathname === "/manifest.webmanifest";
  if (!isCacheableAsset) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkResponse = fetch(event.request).then((response) => {
        cacheResponse(event.request, response);
        return response;
      });
      return cached || networkResponse;
    })
  );
});

self.addEventListener("push", (event) => {
  const payload = {
    title: "پیام جدید در 4D",
    body: "یک پیام جدید در گفتگوی امن داری.",
    url: "/profile"
  };

  if (event.data) {
    try {
      Object.assign(payload, event.data.json());
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/4d-icon-192.png",
      badge: "/icons/4d-icon-192.png",
      tag: payload.tag || "four-d-message",
      data: { url: payload.url || "/profile" }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/profile", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const focused = clientList.find((client) => client.url.startsWith(self.location.origin));
      if (focused) {
        focused.navigate(targetUrl);
        return focused.focus();
      }
      return clients.openWindow(targetUrl);
    })
  );
});
