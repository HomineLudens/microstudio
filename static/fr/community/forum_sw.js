"use strict";
(function () {
    const scope = self;
    const VERSION = 'v2';
    const cacheFiles = [];
    scope.addEventListener('install', event => {
        event.waitUntil(caches.open(VERSION).then(cache => {
            return cache.addAll(cacheFiles);
        }));
    });
    scope.addEventListener("fetch", function (event) {
        event.respondWith(
        // cache.match() may resolve to undefined when there is no cached entry,
        // matching the original untyped JavaScript behavior for this fallback path.
        fetch(event.request).catch(function () {
            return caches.open(VERSION).then(cache => cache.match(event.request));
        }));
    });
})();
