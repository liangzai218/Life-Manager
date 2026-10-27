// 🌟 每次发版，只需修改这里的版本号！
const CACHE_NAME = 'life-manager-v5.2.0'; 

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
// 4. 拦截请求：优先使用缓存（保持你原来的策略）
// ==========================================
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});