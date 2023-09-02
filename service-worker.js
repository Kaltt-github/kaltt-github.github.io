const cacheName = 'kaltt-agenda-cache';
const resourcesToCache = [
    'index.html',
    'global.js',
    'global.css',
    'functions.js',

    'classes/apis.js',
    'classes/art.js',
    'classes/backend.js',
    'classes/colors.js',
    'classes/frontend.js',
    'classes/time.js',

    'fonts/RobotoSlab200.ttf',
    'fonts/RobotoSlab400.ttf',
    'fonts/RobotoSlab500.ttf',
    'fonts/RobotoSlab600.ttf',
    'fonts/RobotoSlab800.ttf',

    'screens/login/classes.js',
    'screens/login/style.css',
    'screens/home/classes.js',
    'screens/home/style.css',
    'screens/edit/classes.js',
    'screens/edit/style.css',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(resourcesToCache))
            .then(_ => console.info('🔵 Service worker: Resources installed'))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (!response) {
                    return new Response("Offline fallback missing", {
                        status: 500,
                        statusText: "Offline",
                        headers: { "Content-Type": "text/plain" }
                    });
                }
                const clone = response.clone();
                caches.open(cacheName)
                    .then(cache => {
                        if (event.request.url.includes('firestore')) {
                            return;
                        }
                        cache.put(event.request, clone)
                    })
                    .catch(_ => console.info('🔵 Service worker: Cache set failure at ' + event.request.url));
                return response;
            })
            .catch(_ => {
                return caches.match(event.request.url)
                    .catch(_ => console.info('🔵 Service worker: Cache get failure at ' + event.request.url));
            })
    )
});