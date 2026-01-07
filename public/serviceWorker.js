const cacheName = "v1";

self.addEventListener("install", (e) => {
  console.log("Service Worker: Installed");
});

self.addEventListener("activate", (e) => {
  console.log("Service Worker: Activated");
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== cacheName) {
            console.log("Service Worker: Clearing Old Cache");
            return caches.delete(cache);
          } else {
            return caches.open(cache).then(async (cacheInstance) => {
              const keys = await cacheInstance.keys();
              const today = new Date().toDateString();
              const test = encodeURIComponent("/api/dayorder?date=" + today);

              const deletionPromises = keys
                .filter((request) => request.url.includes("/api/dayorder"))
                .filter((request) => !request.url.includes(test))
                .map((request) => cacheInstance.delete(request.url));

              return Promise.all(deletionPromises);
            });
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (e) => {
  const isApiRoute = e.request.url.includes("/api/");
  e.respondWith(
    caches.open(cacheName).then((cache) => {
      if (
        (isApiRoute || e.request.method !== "GET") &&
        !e.request.url.includes("api/dayorder")
      ) {
        return fetch(e.request);
      }
      return cache.match(e.request).then((cachedResponse) => {
        const fetchPromise = fetch(e.request).then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }
          const networkResponseClone = networkResponse.clone();
          cache.put(e.request, networkResponseClone);

          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      });
    })
  );
});


self.addEventListener("sync", (event) => {
  if (event.tag === "my-sync-tag") {
    event.waitUntil(syncCache());
  }
});

async function syncCache() {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const today = new Date().toDateString();
  const test = encodeURIComponent("/api/dayorder?date=" + today);

  const deletionPromises = keys
    .filter((request) => request.url.includes("/api/dayorder"))
    .filter((request) => !request.url.includes(test))
    .map((request) => cache.delete(request.url));

  
  return Promise.all(deletionPromises);
}
