/* Church Camera - offline cache.
   The church wifi may have no internet at all (and the laptop's Mobile Hotspot
   often has none either), so once the phone has opened this app on any network
   it must keep working with none. Bump CACHE on every edit. */
var CACHE = 'church-camera-v5';
var FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-512.png',
  './cert.html',
  './church-camera-ca.crt'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).catch(function(){}));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* Cache first: at church, a half-connected network that hangs for 30 seconds is
   worse than no network. Refresh the copy in the background when there is one. */
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      var live = fetch(e.request).then(function(res){
        if (res && res.ok){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }
        return res;
      }).catch(function(){ return hit; });
      return hit || live;
    })
  );
});
