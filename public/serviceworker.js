
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/styles.css",
    '/index.js',
    '/indexdb.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

const STATIC_CACHE = "static-cache-v1";
const DATA_CACHE = "data-cache";

self.addEventListener('install', (event) => {

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                return cache.addAll(FILES_TO_CACHE)
            })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then(keyList => {
                return Promise.all(
                    keyList.map(key => {
                        if (key !== STATIC_CACHE && DATA_CACHE) {
                            return caches.delete(key)
                        }
                    })
                )
            })
    );
    self.clients.claim()
});

self.addEventListener('fetch', (e) => {
    if (e.request.url.includes('/api/')) {
        e.respondWith(caches.open(DATA_CACHE)
        .then(cache => {
            return fetch(e.request)
            .then(response => {
                if (response.status === 200) {
                    cache.put(e.request.url, response.clone());
                }

                return response;
            })
            .catch(err => {
                return cache.match(e.request);
            });

        }).catch(err => console.log(err)))

        return;
    }

    e.respondWith(
        caches.open(STATIC_CACHE).then(cache => {
            return cache.match(e.request)
            .then(response => {
                return response || fetch(e.request);
            });
        })
    )
});


