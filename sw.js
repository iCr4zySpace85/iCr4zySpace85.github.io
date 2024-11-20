const cacheName = 'biblioteca-cache-v1';
const resourcesToCache = [
    '/',
    '/indexdb.html',
    '/manifest.json',
    '/icons/yomerenges.jpg',
    '/style.css',
    '/app.js'
];

// Instalar el Service Worker y cachear recursos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll(resourcesToCache))
    );
});

// Activar el Service Worker y limpiar caches antiguos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(c => c !== cacheName).map(c => caches.delete(c))
            );
        })
    );
});

// Interceptar las solicitudes para trabajar offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
            .catch(() => caches.match('/offline.html'))
    );
});

// Manejar notificaciones push
self.addEventListener('push', event => {
    const data = event.data ? event.data.text() : 'Nueva notificación';
    event.waitUntil(
        self.registration.showNotification('Biblioteca', {
            body: data,
            icon: '/icons/yomerenges.jpg'
        })
    );
});
