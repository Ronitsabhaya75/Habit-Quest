// notification-service-worker.js
// Service Worker for handling notifications in the background

const CACHE_NAME = 'habit-quest-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  // Add other assets that should be cached
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  // Handle scheduling notifications
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const notificationData = event.data.payload;
    
    console.log('Scheduling notification:', notificationData);
    
    // For immediate notifications
    if (!notificationData.showAt || notificationData.showAt <= Date.now()) {
      self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon || '/favicon.ico',
        tag: notificationData.id || 'default-tag',
        // Include other notification options as needed
        actions: [
          {
            action: 'view',
            title: 'View Task'
          },
          {
            action: 'complete',
            title: 'Mark Complete'
          }
        ],
        data: {
          taskId: notificationData.id,
          url: '/'
        }
      });
    } else {
      // For scheduled notifications
      const timeUntilNotification = notificationData.showAt - Date.now();
      
      console.log(`Will show notification in ${timeUntilNotification / 1000} seconds`);
      
      setTimeout(() => {
        self.registration.showNotification(notificationData.title, {
          body: notificationData.body,
          icon: notificationData.icon || '/favicon.ico',
          tag: notificationData.id || 'default-tag',
          // Include other notification options as needed
          actions: [
            {
              action: 'view',
              title: 'View Task'
            },
            {
              action: 'complete',
              title: 'Mark Complete'
            }
          ],
          data: {
            taskId: notificationData.id,
            url: '/'
          }
        });
      }, timeUntilNotification);
    }
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  const notification = event.notification;
  const action = event.action;
  const taskId = notification.data?.taskId;
  
  notification.close();
  
  if (action === 'complete' && taskId) {
    // Handle task completion action
    // Store the completion action for when the app comes online
    const completedTasksKey = 'offlineCompletedTasks';
    
    event.waitUntil(
      clients.matchAll().then(clientList => {
        // Try to find an open window to communicate with
        const activeClient = clientList.find(client => client.visibilityState === 'visible');
        
        if (activeClient) {
          // If there's an active client, send the completion request directly
          activeClient.postMessage({
            type: 'COMPLETE_TASK',
            taskId: taskId
          });
        } else {
          // Otherwise, store it for later
          self.clients.openWindow('/dashboard').then(windowClient => {
            // After window opens, wait a moment then send the message
            setTimeout(() => {
              if (windowClient) {
                windowClient.postMessage({
                  type: 'COMPLETE_TASK',
                  taskId: taskId
                });
              }
            }, 1000);
          });
        }
      })
    );
  } else {
    // Default action is to open the app
    event.waitUntil(
      clients.matchAll().then(clientList => {
        // Check if there's already a window/tab open
        const hadWindowToFocus = clientList.some(client => {
          return client.url === notification.data?.url && 'focus' in client
            ? client.focus()
            : false;
        });
        
        // If no window to focus, open a new one
        if (!hadWindowToFocus) {
          clients.openWindow(notification.data?.url || '/dashboard');
        }
      })
    );
  }
});

// Handle push notifications (for future use with a notification server)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      
      console.log('Service Worker: Push data:', data);
      
      event.waitUntil(
        self.registration.showNotification(data.title, {
          body: data.body,
          icon: data.icon || '/favicon.ico',
          tag: data.tag || 'default-tag',
          data: data.data || {}
        })
      );
    } catch (error) {
      console.error('Error processing push data:', error);
    }
  }
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached response if found
          if (response) {
            return response;
          }
          
          // If not in cache, fetch from network
          return fetch(event.request)
            .then((response) => {
              // Clone the response for caching
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            })
            .catch(() => {
              // If fetch fails (offline), try to serve an offline page
              if (event.request.mode === 'navigate') {
                return caches.match('/offline.html');
              }
              
              // For other resources, just serve what we can
              return new Response('Network error happened', {
                status: 408,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
        })
    );
  }
}); 