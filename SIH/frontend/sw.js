self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('livelihood-saathi-v1').then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/profile.html',
      '/recommendations.html',
      '/dashboard.html',
      '/css/style.css',
      '/js/app.js',
      '/js/voice.js',
      '/js/profile.js',
      '/js/recommendations.js',
      '/js/dashboard.js'
    ]))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
