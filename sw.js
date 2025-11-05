// Service Worker for AI Chat Web App
// Provides offline functionality and caching

const CACHE_NAME = 'ai-chat-v1.0.0';
const STATIC_CACHE_URLS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .catch((error) => {
                console.error('Failed to cache static assets:', error);
            })
    );
    
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Claim control of all clients
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Handle Hugging Face model requests differently
    if (event.request.url.includes('huggingface.co')) {
        event.respondWith(
            caches.open('models-cache').then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('Serving model from cache:', event.request.url);
                        return cachedResponse;
                    }
                    
                    return fetch(event.request).then((networkResponse) => {
                        // Only cache successful responses
                        if (networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                            console.log('Cached model:', event.request.url);
                        }
                        return networkResponse;
                    }).catch(() => {
                        // Return a custom offline response for models
                        return new Response('Model not available offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
                });
            })
        );
        return;
    }
    
    // Handle other requests with cache-first strategy
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Try to fetch from network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Don't cache POST requests or non-successful responses
                        if (event.request.method === 'GET' && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Return offline page for HTML requests
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('./index.html');
                        }
                        
                        // Return a generic offline response
                        return new Response('Offline - Content not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: {
                                'Content-Type': 'text/plain'
                            }
                        });
                    });
            })
    );
});

// Handle background sync for offline functionality
self.addEventListener('sync', (event) => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Perform background tasks here
            console.log('Performing background sync tasks')
        );
    }
});

// Handle push notifications (if needed in the future)
self.addEventListener('push', (event) => {
    console.log('Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New message from AI Chat',
        icon: './icon-192.png',
        badge: './icon-72.png',
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open Chat',
                icon: './icon-192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: './icon-192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('AI Chat', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        // Open the app
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    console.log('Service worker received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Handle errors
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
});