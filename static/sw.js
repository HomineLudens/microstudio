"use strict";
(function () {
    const scope = self;
    const VERSION = 'v2';
    const cacheFiles = [
    /*  "https://cdnjs.cloudflare.com/ajax/libs/engine.io-client/3.2.1/engine.io.min.js",
  
      scope.registration.scope,
      scope.registration.scope+'js/util/canvas2d.js',
      scope.registration.scope+'js/runtime/runtime.js',
      scope.registration.scope+'js/runtime/screen.js',
      scope.registration.scope+'js/runtime/sprite.js',
      scope.registration.scope+'js/runtime/audio/audio.js',
      scope.registration.scope+'js/runtime/audio/beeper.js',
      scope.registration.scope+'js/play/player.js',
      scope.registration.scope+'js/play/playerclient.js',
      scope.registration.scope+'sw.js'*/
    ];
    scope.addEventListener('install', event => {
        event.waitUntil(caches.open(VERSION).then(cache => {
            return cache.addAll(cacheFiles);
        }));
    });
    scope.addEventListener('fetch', function (event) {
        //console.info(event.request);
        if (event.request.method != "GET" || event.request.url.indexOf("/engine.io/") > 0) {
            return event.respondWith(fetch(event.request));
        }
        /* cache then network with caching */
        event.respondWith(caches.open(VERSION).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                var fetchPromise = fetch(event.request).then(function (networkResponse) {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
                return response || fetchPromise;
            });
        }));
    });
})();
