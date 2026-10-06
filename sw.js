/* Service worker: rete prima (così gli aggiornamenti del programma arrivano subito),
   cache come riserva per l'uso offline. Incrementa CACHE se cambi la struttura dei file. */
var CACHE = 'visavi-2026-v3';
var SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'assets/fonts.css', 'assets/fonts/bebas-neue-latin-400-normal.woff2', 'assets/fonts/bebas-neue-latin-ext-400-normal.woff2', 'assets/fonts/inter-latin-400-normal.woff2', 'assets/fonts/inter-latin-500-normal.woff2', 'assets/fonts/inter-latin-600-normal.woff2', 'assets/fonts/inter-latin-700-normal.woff2', 'assets/style.css', 'assets/i18n.js', 'assets/data.js', 'assets/core.js', 'assets/app.js',
  'assets/img/visavi-logo.png', 'assets/img/artisti-associati.png', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin) return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) { return hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined); });
    })
  );
});
