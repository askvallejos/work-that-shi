const CACHE_NAME = 'work-that-shi';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/site.webmanifest',
  '/placeholder.svg'
];

let backgroundTimer = null;
let timerTimeout = null;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                if (!event.request.url.includes('/api/')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        ).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

self.addEventListener('message', (event) => {
  const { type, endTime, initialTime } = event.data;
  
  switch (type) {
    case 'TIMER_START':
      startBackgroundTimer(endTime, initialTime);
      break;
    case 'TIMER_STOP':
      stopBackgroundTimer();
      break;
  }
});

function startBackgroundTimer(endTime, initialTime) {
  stopBackgroundTimer();
  
  backgroundTimer = {
    endTime,
    initialTime,
    startTime: Date.now()
  };
  
  const timeToComplete = endTime - Date.now();
  
  if (timeToComplete > 0) {
    timerTimeout = setTimeout(() => {
      showTimerNotification();
      stopBackgroundTimer();
    }, timeToComplete);
    
    console.log(`Background timer started, will complete in ${Math.ceil(timeToComplete / 1000)} seconds`);
  }
}

function stopBackgroundTimer() {
  if (timerTimeout) {
    clearTimeout(timerTimeout);
    timerTimeout = null;
  }
  backgroundTimer = null;
}

function showTimerNotification() {
  self.registration.showNotification('Rest Timer Complete!', {
    body: 'Time for your next set!',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    tag: 'workout-timer',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open Workout'
      }
    ],
    data: {
      url: '/',
      type: 'timer-complete'
    }
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clients) => {
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      checkExistingTimer()
    ]).then(() => self.clients.claim())
  );
});

async function checkExistingTimer() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SERVICE_WORKER_READY' });
    });
  } catch (error) {
    console.warn('Failed to check existing timer:', error);
  }
}