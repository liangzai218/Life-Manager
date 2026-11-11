// 🌟 每次发版，只需修改这里的版本号！
const CACHE_NAME = 'life-manager-v5.4.4.5'; 

// 🌟 核心修复 1：把所有本地核心依赖都加进预缓存列表，彻底保障离线可用
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app-icon.png',
  './manifest.json',
  './tailwind.min.js',
  './lucide.min.js',
  './confetti.min.js'
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
// 4. 拦截请求：优先使用缓存
// ==========================================
self.addEventListener('fetch', (event) => {
    // 🌟 核心修复 2：专门拦截“页面导航请求”（mode === 'navigate'）
    // 不管 WebView 在 URL 后面加了什么乱七八糟的参数，统统返回纯正的本地 index.html
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.match('./index.html').then((response) => {
                return response || fetch(event.request);
            })
        );
        return;
    }

    // 其他静态资源（JS、图片等）按原逻辑匹配缓存，匹配不到再走网络
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});