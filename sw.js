/* Service worker: aplikace funguje i bez internetu.
 * Při každé změně souborů zvyš VERZE, ať si telefony stáhnou novou verzi. */
var VERZE = "konska-matika-20261025-095150";
var SOUBORY = [
  "./", "index.html", "styles.css", "manifest.webmanifest",
  "data/ucivo.js", "data/pribeh.js",
  "js/cestina.js", "js/uloziste.js", "js/zvuky.js", "js/hlas.js", "js/grafika.js", "js/ulohy.js", "js/ulohy2.js", "js/napoveda.js", "js/hry.js", "js/app.js",
  "icons/ikona.svg", "icons/ikona-180.png", "icons/ikona-192.png", "icons/ikona-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERZE).then(function (c) { return c.addAll(SOUBORY); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (klice) {
    return Promise.all(klice.filter(function (k) { return k !== VERZE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// nejdřív síť (ať jsou změny hned vidět), bez internetu z mezipaměti
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(function (r) {
      var kopie = r.clone();
      caches.open(VERZE).then(function (c) { c.put(e.request, kopie); });
      return r;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match("index.html"); });
    })
  );
});
