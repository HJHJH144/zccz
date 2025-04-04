// 缓存版本
const CACHE_NAME = 'love-app-v2';

// 需要缓存的资源列表
const RESOURCES_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/chat_multimedia.js',
    '/android-launchericon-192-192.png',
    '/android-launchericon-512-512.png',
    '/manifest.json',
    'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js',
    'https://www.gstatic.com/firebasejs/8.10.1/firebase-storage.js',
    'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js'
];

// Service Worker 安装
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('缓存已打开');
                return cache.addAll(RESOURCES_TO_CACHE);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// 清理旧缓存
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
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// 拦截请求并从缓存提供资源
self.addEventListener('fetch', (event) => {
    // 对于Firebase等API请求，不进行缓存，直接从网络获取
    if (event.request.url.includes('firebaseio.com') ||
        event.request.url.includes('googleapis.com')) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 如果找到了缓存响应，则返回
                if (response) {
                    return response;
                }

                // 克隆请求因为请求是一个流，只能使用一次
                const fetchRequest = event.request.clone();

                // 从网络获取资源
                return fetch(fetchRequest).then(
                    (response) => {
                        // 检查响应是否有效
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 克隆响应因为响应是一个流，只能使用一次
                        const responseToCache = response.clone();

                        // 打开缓存并存储响应
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
}); 