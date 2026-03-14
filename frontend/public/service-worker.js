// Service Worker for Lotus Beauty Parlour PWA
// Version 4 - Fixed for real-time updates
const CACHE_VERSION = 'v4';
const STATIC_CACHE = `lotus-static-${CACHE_VERSION}`;
const API_CACHE = `lotus-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `lotus-images-${CACHE_VERSION}`;

// Static assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png'
];

// API endpoints - NOW using network-first for real-time updates
const NETWORK_FIRST_API = [
  '/api/services',
  '/api/gallery',
  '/api/videos',
  '/api/staff',
  '/api/settings',
  '/api/reviews',
  '/api/appointments',
  '/api/auth',
  '/api/admin',
  '/api/customers',
  '/api/coupons',
  '/api/support',
  '/api/enquiries'
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('lotus-') && 
                     name !== STATIC_CACHE && 
                     name !== API_CACHE &&
                     name !== IMAGE_CACHE;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle API requests - ALWAYS use network-first for real-time updates
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle image requests
  if (isImageRequest(request)) {
    event.respondWith(cacheFirstForImages(request));
    return;
  }

  // Handle static assets and navigation
  event.respondWith(cacheFirstWithFallback(request));
});

// Check if request is for an image
function isImageRequest(request) {
  const url = new URL(request.url);
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname) ||
         request.destination === 'image';
}

// Cache-first strategy for static assets with offline fallback
async function cacheFirstWithFallback(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    throw error;
  }
}

// Cache-first for images with long-term caching
async function cacheFirstForImages(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return a placeholder image or nothing for failed image requests
    return new Response('', { status: 404, statusText: 'Not Found' });
  }
}

// Network-first strategy for API data (supports real-time updates)
async function networkFirst(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseToCache = await addTimestampHeader(networkResponse);
      cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Add timestamp header to response for TTL checking
async function addTimestampHeader(response) {
  const body = await response.clone().blob();
  const headers = new Headers(response.headers);
  headers.set('sw-cached-time', Date.now().toString());
  
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

// Background update without blocking
function updateInBackground(request, cache) {
  fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const responseToCache = await addTimestampHeader(response);
        cache.put(request, responseToCache);
        console.log('[SW] Background update completed for:', request.url);
        
        // Notify clients of update
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'CACHE_UPDATED',
            url: request.url
          });
        });
      }
    })
    .catch((error) => {
      console.log('[SW] Background update failed:', error);
    });
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Lotus Beauty Parlour', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => {
        if (name.startsWith('lotus-')) {
          caches.delete(name);
        }
      });
    });
  }
  
  // Handle cache invalidation for specific API types
  if (event.data.type === 'INVALIDATE_API_CACHE') {
    const cacheType = event.data.cacheType;
    const apiPaths = {
      services: '/api/services',
      gallery: '/api/gallery',
      videos: '/api/videos',
      staff: '/api/staff',
      settings: '/api/settings',
      reviews: '/api/reviews'
    };
    
    const apiPath = apiPaths[cacheType];
    if (apiPath) {
      caches.open(API_CACHE).then((cache) => {
        cache.keys().then((requests) => {
          requests.forEach((request) => {
            if (request.url.includes(apiPath)) {
              cache.delete(request);
              console.log('[SW] Invalidated cache for:', apiPath);
            }
          });
        });
      });
    }
  }
});
