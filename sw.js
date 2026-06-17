/* Psychiatry Shlav Aleph — service worker (offline cache) */
const CACHE = "psych-shlava-v1.6.19";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./data/topics.json",
  "./data/syllabus.json",
  "./data/practice_questions.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];
const APP_SHELL = new Set(["/", "/index.html", "/Psychiatry/", "/Psychiatry/index.html"]);

function isAppShell(url) {
  return APP_SHELL.has(url.pathname) || url.pathname.endsWith("/");
}

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
  if (e.data && e.data.type === "CLEAR_PROTECTED_CACHE") {
    e.waitUntil(caches.open(CACHE).then(cache => Promise.all([
      cache.delete("./data/questions.json"),
      cache.delete("./data/explanations.json"),
      cache.delete("./docs/answer_key_doubts.json")
    ])));
  }
});

// network-first for data and app shell, cache-first for static assets
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const isData = url.pathname.endsWith(".json");
  const isAuthorized = e.request.headers.has("Authorization");
  const shellRequest = e.request.mode === "navigate" || isAppShell(url);
  if (shellRequest) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        fetch(e.request).then(r => {
          if (!r || !r.ok) return caches.match(e.request).then(cached => cached || caches.match("./index.html").then(shell => shell || r));
          if (r && r.ok) {
            cache.put(e.request, r.clone());
            cache.put("./index.html", r.clone());
            return r;
          }
        }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
      )
    );
    return;
  }
  if (isData) {
    e.respondWith(
      fetch(e.request).then(r => {
        if (isAuthorized) return r;
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // cache-first for static assets
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
