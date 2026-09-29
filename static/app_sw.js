"use strict";
(function () {
    const scope = self;
    scope.addEventListener('fetch', function (event) {
        event.respondWith(fetch(event.request));
    });
})();
