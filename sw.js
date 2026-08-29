/* Minimal offline app-shell cache so the kiosk survives a dropped wifi
   connection or a tablet restart without ever showing a broken page.
   Submissions themselves are queued in localStorage by index.html,
   not here — this only caches the static files that make up the UI. */

const CACHE_NAME = "co-antique-kiosk-v1";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./dfa-seal-color.png",
  "./dfa-seal-mono.png",
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

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((resp) => {
        // Cache same-origin GETs as we see them (e.g. Google Fonts CSS/files)
        if (event.request.method === "GET" && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
