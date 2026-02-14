const CACHE_NAME = 'mission-control-v1';
const STATIC_ASSETS = [
  '/',
  '/api/task-tracker',
  '/api/activity',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // API requests - network first, cache fallback
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached data if network fails
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Return empty data if nothing cached
            return new Response(JSON.stringify({ offline: true }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }
  
  // Static assets - cache first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      
      return fetch(request).then((response) => {
        // Cache new static assets
        if (response.ok && (request.url.includes('/icons/') || request.url.includes('/_next/'))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      });
    })
  );
});

// Background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-alerts') {
    event.waitUntil(checkAlerts());
  }
});

async function checkAlerts() {
  try {
    const response = await fetch('/api/alerts');
    const alerts = await response.json();
    
    alerts.forEach((alert) => {
      self.registration.showNotification('Mission Control Alert', {
        body: alert,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'mission-control-alert',
        requireInteraction: true
      });
    });
  } catch (error) {
    console.error('[SW] Alert check failed:', error);
  }
}
