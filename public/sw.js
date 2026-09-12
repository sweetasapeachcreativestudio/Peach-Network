const CACHE = "peach-network-shell-v1";
const SHELL = ["/", "/auth"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Never cache API calls or authenticated data.
  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/")) return;

  // Network first for app pages. Fall back only to the tiny public shell cache.
  event.respondWith(
    fetch(req).catch(async () => {
      const cached = await caches.match(req);
      return cached || caches.match("/");
    })
  );
});
