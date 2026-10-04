const CACHE = "ss-index-4.30.2";
const FILES = ["./","bench.html","favicon-32.png","icon-128.png","icon-192.png","icon-512.png","index-4.30.2.pck","index.apple-touch-icon.png","index.audio.position.worklet.js","index.audio.worklet.js","index.html","index.icon.png","index.js","index.png","index.wasm","manifest.webmanifest"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("ss-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
function page(req) {
  const stored = () => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match("index.html"));
  const net = fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; });
  const slow = new Promise(res => setTimeout(res, 4000)).then(stored);
  return Promise.race([net, slow]).then(r => r || net).catch(() => stored().then(r => r || Response.error()));
}
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const path = new URL(req.url).pathname;
  if (req.mode === "navigate" || path.endsWith("/") || path.endsWith("/index.html")) { e.respondWith(page(req)); return; }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(r => r || fetch(req)));
});