// ─────────────────────────────────────────────────────────────────
// Service worker — instant loads + full offline for both apps.
//
// Lives at the repo root so its scope covers /de/ and /fr/ with one
// worker (GitHub Pages cannot set the Service-Worker-Allowed header).
//
// Design: a passthrough/fallback proxy, NOT a precache install.
//  • Only same-origin and font/SDK CDN GET requests are intercepted
//    (allowlist) — sync and auth traffic is never touched, so a
//    mistake here can only cost caching, never break syncing.
//  • HTML/JS/CSS are network-first: with no build step, serving a
//    mixed-version set of the app's scripts must be impossible
//    whenever we're online. The cache serves offline & slow networks.
//  • One online visit fills the cache; there is no precache manifest
//    to forget when a new deck file is added.
// ─────────────────────────────────────────────────────────────────

const CACHE_PAGES = "pages-v1";
const CACHE_APP   = "app-v1";
const CACHE_CDN   = "cdn-v1";
const ALL_CACHES  = [CACHE_PAGES, CACHE_APP, CACHE_CDN];

const NETWORK_TIMEOUT_MS = 3000;
const CDN_CACHE_MAX_ENTRIES = 80;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    // Pre-warm just the shells — everything else is cached on first use.
    const cache = await caches.open(CACHE_PAGES);
    await Promise.allSettled([
      "de/index.html", "fr/index.html", "core.css",
    ].map(path => fetch(new Request(path, { cache: "reload" }))
      .then(res => { if (res.ok) return cache.put(path, res); })));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => !ALL_CACHES.includes(n)).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFontCss  = url.hostname === "fonts.googleapis.com";
  const isFontBin  = url.hostname === "fonts.gstatic.com";
  const isGstatic  = url.hostname === "www.gstatic.com";
  // Anything else (Firestore, auth, Google sign-in, …) is not ours to touch.
  if (!sameOrigin && !isFontCss && !isFontBin && !isGstatic) return;

  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req, CACHE_PAGES));
  } else if (sameOrigin && /\.(js|css)$/.test(url.pathname)) {
    event.respondWith(networkFirst(req, CACHE_APP));
  } else if (sameOrigin) {
    event.respondWith(staleWhileRevalidate(req, CACHE_APP));
  } else if (isFontCss) {
    event.respondWith(staleWhileRevalidate(req, CACHE_CDN));
  } else {
    // Font binaries and versioned SDK files — immutable URLs.
    event.respondWith(cacheFirst(req, CACHE_CDN));
  }
});

// ── STRATEGIES ────────────────────────────────

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetchWithTimeout(req, NETWORK_TIMEOUT_MS);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    const cached = await cache.match(req, { ignoreSearch: req.mode === "navigate" });
    if (cached) return cached;
    throw e;
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const refresh = fetch(req).then(res => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => undefined);
  return cached || refresh.then(res => {
    if (!res) throw new Error("offline and not cached: " + req.url);
    return res;
  });
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res && (res.ok || res.type === "opaque")) {
    cache.put(req, res.clone());
    trimCache(cache, CDN_CACHE_MAX_ENTRIES); // fire-and-forget quota guard
  }
  return res;
}

function fetchWithTimeout(req, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("network timeout")), ms);
    fetch(req).then(res => { clearTimeout(timer); resolve(res); },
                    err => { clearTimeout(timer); reject(err); });
  });
}

async function trimCache(cache, maxEntries) {
  try {
    const keys = await cache.keys();
    for (let i = 0; i < keys.length - maxEntries; i++) {
      await cache.delete(keys[i]);
    }
  } catch (e) {}
}
