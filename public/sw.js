self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Cloud Klepto';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'cloudklepto',
    data: { url: data.url || '/' },
    requireInteraction: data.requireInteraction || false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
