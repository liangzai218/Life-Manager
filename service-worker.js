// 🌟 每次发版，只需修改这里的版本号！
const CACHE_NAME = 'life-manager-v5.4.3.2'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app-icon.png'
];

// ==========================================
// 1. 监听安装事件：只缓存文件，绝对不自动跳过等待！
// ==========================================
self.addEventListener('install', (event) => {
    // 注意：这里千万不要写 self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

// ==========================================
// 2. 监听消息事件：接收前端“立即更新”的指令
// ==========================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting(); // 只有前端明确下达指令，才跳过等待
    }
});

// ==========================================
// 3. 监听激活事件：清理旧缓存，并立刻接管页面
// ==========================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        }).then(() => {
            return self.clients.claim(); // 接管所有页面
        })
    );
});

// ==========================================
// 4. 拦截请求：HTML 走网络优先，其他走缓存优先
// ==========================================
self.addEventListener('fetch', (event) => {
    // 🌟 核心：如果是请求 HTML 页面，必须走网络优先！
    if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
        event.respondWith(
            fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            }).catch(() => {
                return caches.match(event.request); // 断网才用缓存
            })
        );
    } else {
        // 其他静态资源走缓存
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});