const CACHE_NAME = 'tengra-v1';
const OFFLINE_URL = '/offline';

// Files to cache
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip API requests and external URLs
    if (url.pathname.startsWith('/api') || url.origin !== location.origin) {
        return;
    }

    // Skip chrome-extension and other protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }

    event.respondWith(
        (async () => {
            try {
                // Try network first
                const networkResponse = await fetch(request);

                // Cache successful responses
                if (networkResponse.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(request, networkResponse.clone());
                }

                return networkResponse;
            } catch (error) {
                // Network failed, try cache
                const cachedResponse = await caches.match(request);

                if (cachedResponse) {
                    return cachedResponse;
                }

                // For navigation requests, show offline page
                if (request.mode === 'navigate') {
                    const offlineResponse = await caches.match(OFFLINE_URL);
                    if (offlineResponse) {
                        return offlineResponse;
                    }
                }

                throw error;
            }
        })()
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    console.log('[SW] Syncing data...');
    // Implement background sync logic here
}

// Push notifications
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');

    let data = {
        title: 'Tengra',
        body: 'Yeni bir bildiriminiz var',
        icon: 'https://cdn.tengra.studio/uploads/tengra_without_text.png',
        badge: 'https://cdn.tengra.studio/uploads/tengra_without_text.png',
        data: { url: '/' }
    };

    if (event.data) {
        try {
            const payload = event.data.json();
            data = { ...data, ...payload };
        } catch {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag || 'tengra-notification',
        data: data.data,
        actions: data.actions || [
            { action: 'view', title: 'Görüntüle' },
            { action: 'dismiss', title: 'Kapat' }
        ],
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        vibrate: [200, 100, 200],
        timestamp: Date.now()
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    event.notification.close();

    // Handle dismiss action
    if (event.action === 'dismiss') {
        return;
    }

    const data = event.notification.data || {};
    let url = data.url || '/';

    // Handle specific actions
    if (event.action && data.actionUrls && data.actionUrls[event.action]) {
        url = data.actionUrls[event.action];
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there's already a window open with the target URL
            for (const client of windowClients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // Try to focus any existing window
            for (const client of windowClients) {
                if ('focus' in client && 'navigate' in client) {
                    return client.focus().then(() => client.navigate(url));
                }
            }
            // Open new window
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Notification close event (for analytics)
self.addEventListener('notificationclose', () => {
    console.log('[SW] Notification closed without interaction');
    // Could send analytics here
});
