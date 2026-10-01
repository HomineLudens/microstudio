(function () {
  const scope = self as unknown as ServiceWorkerGlobalScope;

  scope.addEventListener('fetch', function(event) {
    event.respondWith(fetch(event.request));
  });
})();
