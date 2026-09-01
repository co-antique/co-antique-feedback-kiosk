/* Minimal offline app-shell cache so the kiosk survives a dropped wifi
   connection or a tablet restart without ever showing a broken page.
   Submissions themselves are queued in localStorage by index.html,
   not here — this only caches the static files that make up the UI. */

const CACHE_NAME = "co-antique-kiosk-v5";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./dfa-seal-color.png",
  "./dfa-seal-mono.png",
  "./bagong-pilipinas-logo.png",
  "./swoosh-top.png",
  "./swoosh-bottom.png",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache calls to the Apps Script submission endpoint — those must
  // always hit the network (or fail and get queued by index.html).
  if (url.hostname.includes("script.google.com")) return;

  // The HTML page itself: try the network FIRST so a freshly-uploaded
  // index.html shows up on the very next reload, not just after a hard
  // refresh. Only fall back to the cached copy if the network is down
  // (that's what keeps the kiosk usable through a dropped wifi connection).
  const isPage = event.request.mode === "navigate" || url.pathname.endsWith("index.html") || url.pathname.endsWith("/");
  if (isPage) {
    event.respondWith(
      fetch(event.request).then((resp) => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return resp;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Everything else (icons, manifest, fonts): cache-first, since these
  // rarely change and this is what makes repeat loads feel instant.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((resp) => {
        if (event.request.method === "GET" && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});