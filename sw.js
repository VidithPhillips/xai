const CACHE_NAME = 'xai-explorer-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/main.js',
    '/js/services/data-service.js',
    '/js/utils/three-setup.js',
    '/js/utils/ui-controls.js',
    '/js/utils/visualization-helpers.js',
    '/js/utils/loading-animation.js',
    '/js/utils/performance.js',
    '/js/utils/error-boundary.js',
    '/js/visualizations/intro-animation.js',
    '/js/visualizations/neural-network-vis.js',
    '/js/visualizations/feature-importance-vis.js',
    '/js/visualizations/local-explanations-vis.js',
    '/js/visualizations/counterfactuals-vis.js'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate service worker and clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch assets from cache first, then network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
}); 