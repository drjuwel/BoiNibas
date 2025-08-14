const CACHE_NAME = 'book-app-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/add.html',
  '/style.css',
  '/add.css',
  '/script.js',
  '/add.js',
  '/png/reload.png'
  // তোমার আরও images থাকলে এখানে add করো
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
